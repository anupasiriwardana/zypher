import mongoose from 'mongoose';

const PaymentSchema = new mongoose.Schema({
    userId : {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    planId: {
        type: String,
        required: true
    },
    amount:{
        type : mongoose.Schema.Types.Double,
        required: true
    },
    currency:{
        type: String,
        required: true
    },
    payhereOrderId:{
        type: String,
        required: true
    },
    paymentDescription:{
        type: String,
        required: true
    },
    isYearly:{
        type: Boolean,
        required: true
    },
    status:{
        type: String,
        enum: ['pending', 'completed', 'failed'],
        default: 'pending'
    },
    createdAt:{
        type: Date,
        required: true,
        default: Date.now
    },
    updatedAt:{
        type: Date,
        required: true,
        default: Date.now
    },
    payherePaymentId:{
        type: String,
        default: null
    },
    paymentDate:{
        type: Date,
        default: null
    }
}, {
    timestamps: true
});
    
export default mongoose.models.Payment || mongoose.model('Payment', PaymentSchema);