package com.procurement.enterpriseApp.model;

/**
 * Data entered on the dummy admin payment page.
 *
 * The UPI PIN is used only for demo verification and is NEVER persisted.
 */
public class PaymentRequest {

    private String paymentMethod;
    private String accountHolderName;
    private String demoAccountNumber;
    private String bankName;
    private String ifsc;
    private String upiId;
    private String upiPin;
    private String cardLast4;
    private boolean qrScanned;

    public PaymentRequest() {
    }

    public String getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(String paymentMethod) {
        this.paymentMethod = paymentMethod;
    }

    public String getAccountHolderName() {
        return accountHolderName;
    }

    public void setAccountHolderName(String accountHolderName) {
        this.accountHolderName = accountHolderName;
    }

    public String getDemoAccountNumber() {
        return demoAccountNumber;
    }

    public void setDemoAccountNumber(String demoAccountNumber) {
        this.demoAccountNumber = demoAccountNumber;
    }

    public String getBankName() {
        return bankName;
    }

    public void setBankName(String bankName) {
        this.bankName = bankName;
    }

    public String getIfsc() {
        return ifsc;
    }

    public void setIfsc(String ifsc) {
        this.ifsc = ifsc;
    }

    public String getUpiId() {
        return upiId;
    }

    public void setUpiId(String upiId) {
        this.upiId = upiId;
    }

    public String getUpiPin() {
        return upiPin;
    }

    public void setUpiPin(String upiPin) {
        this.upiPin = upiPin;
    }

    public String getCardLast4() {
        return cardLast4;
    }

    public void setCardLast4(String cardLast4) {
        this.cardLast4 = cardLast4;
    }

    public boolean isQrScanned() {
        return qrScanned;
    }

    public void setQrScanned(boolean qrScanned) {
        this.qrScanned = qrScanned;
    }
}
