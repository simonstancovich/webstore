// server/src/stripe/stripe.controller.ts
import {
  Controller,
  Post,
  Body,
  Req,
  Headers,
  RawBodyRequest,
  UseGuards,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { StripeService } from './stripe.service';

@Controller('stripe')
export class StripeController {
  constructor(private readonly stripeService: StripeService) {}

  @Post('create-payment-intent')
  async createPaymentIntent(
    @Body()
    createPaymentDto: {
      amount: number;
      currency: string;
      metadata?: any;
    },
  ) {
    const { amount, currency, metadata } = createPaymentDto;
    return this.stripeService.createPaymentIntent(amount, currency, metadata);
  }

  @Post('webhook')
  async webhook(
    @Headers('stripe-signature') signature: string,
    @Req() req: RawBodyRequest<Request>,
  ) {
    let event;

    if (!signature) {
      throw new HttpException(
        'Stripe signature is missing',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (!req.rawBody) {
      throw new HttpException(
        'Stripe request body is missing',
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      event = this.stripeService.constructEventFromPayload(
        signature,
        req.rawBody,
      );
    } catch (err) {
      throw new HttpException(
        `Webhook Error: ${err.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }

    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object;
        console.log('PaymentIntent was successful!', paymentIntent);
        break;
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    return { received: true };
  }
}
