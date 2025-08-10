const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
    {
        phone: {
            type: String,
            required: [true, 'Telefon numarası zorunludur'],
            unique: true,
            trim: true
        },
        password: {
            type: String,
            required: [true, 'Şifre zorunludur'],
            minlength: [6, 'Şifre en az 6 karakter olmalıdır']
        },
        name: {
            type: String,
            default: '',
            trim: true
        },
        role: {
            type: String,
            default: 'user',
            enum: ['user', 'admin']
        }
    },
    { timestamps: true }
);

// 📌 MongoDB modelini oluştur
module.exports = mongoose.model('User', userSchema);
