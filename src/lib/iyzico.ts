// Iyzico Payment Integration
// This is a simplified version for demonstration purposes

export interface IyzicoPaymentRequest {
  price: string
  paidPrice: string
  currency: string
  basketId: string
  paymentGroup: string
  callbackUrl: string
  enabledInstallments: number[]
  buyer: {
    id: string
    name: string
    surname: string
    email: string
    phoneNumber: string
    identityNumber: string
    address: string
    city: string
    country: string
    zipCode: string
  }
  shippingAddress: {
    contactName: string
    city: string
    country: string
    address: string
    zipCode: string
  }
  billingAddress: {
    contactName: string
    city: string
    country: string
    address: string
    zipCode: string
  }
  basketItems: Array<{
    id: string
    name: string
    category1: string
    itemType: string
    price: string
  }>
}

export interface IyzicoPaymentResponse {
  status: string
  paymentId: string
  conversationId: string
  price: string
  paidPrice: string
  installment: number
  paymentStatus: string
  fraudStatus: number
  merchantCommissionRate: number
  merchantCommissionRateAmount: number
  iyziCommissionRateAmount: number
  iyziCommissionFee: number
  cardType: string
  cardAssociation: string
  cardFamily: string
  cardToken: string
  cardUserKey: string
  binNumber: string
  paymentTransactionId: string
  authCode: string
  phase: string
  lastFourDigits: string
  posOrderId: string
  url: string
  htmlContent: string
}

class IyzicoService {
  private apiKey: string
  private secretKey: string
  private baseUrl: string

  constructor() {
    this.apiKey = process.env.IYZICO_API_KEY || 'sandbox-api-key'
    this.secretKey = process.env.IYZICO_SECRET_KEY || 'sandbox-secret-key'
    this.baseUrl = process.env.IYZICO_BASE_URL || 'https://sandbox-api.iyzipay.com'
  }

  async createPayment(request: IyzicoPaymentRequest): Promise<IyzicoPaymentResponse> {
    // Iyzico API request
    const iyzicoRequest = {
      locale: 'tr',
      conversationId: `conv_${Date.now()}`,
      price: request.price,
      paidPrice: request.paidPrice,
      currency: request.currency,
      installment: 1,
      paymentChannel: 'WEB',
      paymentGroup: request.paymentGroup,
      callbackUrl: request.callbackUrl,
      enabledInstallments: request.enabledInstallments,
      buyer: request.buyer,
      shippingAddress: request.shippingAddress,
      billingAddress: request.billingAddress,
      basketItems: request.basketItems
    }

    // Generate authorization header for Iyzico
    const randomString = this.generateRandomString()
    const dataString = JSON.stringify(iyzicoRequest)
    const hashString = this.generateHash(randomString, dataString)

    const response = await fetch(`${this.baseUrl}/payment/iyzipos/checkoutform/initialize/auth`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `IYZWS ${this.apiKey}:${hashString}`,
        'x-iyzi-rnd': randomString,
        'x-iyzi-client-version': 'iyzipay-node-2.0.48'
      },
      body: dataString
    })

    const result = await response.json()

    if (result.status === 'success') {
      return {
        status: 'success',
        paymentId: result.token,
        conversationId: result.conversationId,
        price: request.price,
        paidPrice: request.paidPrice,
        installment: 1,
        paymentStatus: 'INITIALIZE',
        fraudStatus: 1,
        merchantCommissionRate: 0.035,
        merchantCommissionRateAmount: parseFloat(request.price) * 0.035,
        iyziCommissionRateAmount: 0,
        iyziCommissionFee: 0,
        cardType: 'CREDIT_CARD',
        cardAssociation: 'VISA',
        cardFamily: 'Visa',
        cardToken: '',
        cardUserKey: '',
        binNumber: '',
        paymentTransactionId: '',
        authCode: '',
        phase: 'INITIALIZE',
        lastFourDigits: '',
        posOrderId: '',
        url: result.paymentPageUrl,
        htmlContent: result.paymentPageUrl
      }
    } else {
      throw new Error(result.errorMessage || 'Payment initialization failed')
    }
  }

  async verifyPayment(paymentId: string): Promise<boolean> {
    // Iyzico payment verification
    const verifyRequest = {
      locale: 'tr',
      conversationId: `conv_${Date.now()}`,
      token: paymentId
    }

    const randomString = this.generateRandomString()
    const dataString = JSON.stringify(verifyRequest)
    const hashString = this.generateHash(randomString, dataString)

    const response = await fetch(`${this.baseUrl}/payment/iyzipos/checkoutform/auth/ecom/detail`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `IYZWS ${this.apiKey}:${hashString}`,
        'x-iyzi-rnd': randomString,
        'x-iyzi-client-version': 'iyzipay-node-2.0.48'
      },
      body: dataString
    })

    const result = await response.json()
    return result.status === 'success' && result.paymentStatus === 'SUCCESS'
  }

  private generateRandomString(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
  }

  private generateHash(randomString: string, dataString: string): string {
    const crypto = require('crypto')
    // Iyzico hash format: randomString + secretKey + dataString
    const hashString = randomString + this.secretKey + dataString
    console.log('Hash input:', hashString)
    const hash = crypto.createHash('sha1').update(hashString, 'utf8').digest('base64')
    console.log('Generated hash:', hash)
    return hash
  }
}

export const iyzicoService = new IyzicoService()
