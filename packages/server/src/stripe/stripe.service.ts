// server/src/stripe/stripe.service.ts
import { Injectable, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

@Injectable()
export class StripeService {
  private stripe: Stripe;

  constructor(private configService: ConfigService) {
    const stripeKey = this.configService.get<string>('STRIPE_SECRET_KEY');
    if (!stripeKey) {
      throw new Error('Stripe secret key is not defined');
    }
    this.stripe = new Stripe(stripeKey, {
        apiVersion: '2025-01-27.acacia', 
      });
  }

  /**
   * Create a Payment Intent
   */
  async createPaymentIntent(amount: number, currency: string, metadata?: any) {
    return this.stripe.paymentIntents.create({
      amount,
      currency,
      metadata,
    });
  }

  /**
   * Retrieve Payment Intent
   */
  async retrievePaymentIntent(paymentIntentId: string) {
    return this.stripe.paymentIntents.retrieve(paymentIntentId);
  }

  /**
   * Confirm Payment Intent
   */
  async confirmPaymentIntent(paymentIntentId: string) {
    return this.stripe.paymentIntents.confirm(paymentIntentId);
  }

  /**
   * Handle webhooks
   */
  constructEventFromPayload(signature: string, payload: Buffer) {
    const endpointSecret = this.configService.get<string>('STRIPE_WEBHOOK_SECRET');

    if (!endpointSecret) {
      throw new Error('Stripe webhook secret is not defined');
    }
    
    return this.stripe.webhooks.constructEvent(payload, signature, endpointSecret);
  }
}
