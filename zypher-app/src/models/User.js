import mongoose from "mongoose";

const { Schema } = mongoose;

const userSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        default: null,
    },
    role: {
        type: String,
        enum: ["primary-user", "admin", "rule-maintainer", "rule-developer", "rule-implementer", "educator", "manager"],
        default: "primary-user",
    },
    provider: {
        type: String,
        enum: ["local", "google", "github"],
        default: "local",
    },
    image: {
        type: String,
        default: null
    },
}, { timestamps: true }
);

// Custom validation after the schema is defined
userSchema.pre("validate", function (next) {
    if(this.provider === "local" && !this.password) {
        this.invalidate("password", "Password is required for local users");
    }
    next();
});

export default mongoose.models.User || mongoose.model("User", userSchema);