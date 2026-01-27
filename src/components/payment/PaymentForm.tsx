import { useState } from "react";
import { motion } from "framer-motion";
import { User, Phone, Mail, ArrowRight, Shield, Zap, Award, CheckCircle, Lock, TrendingUp } from "lucide-react";
import { Input } from "@/components/ui/input";
import { z } from "zod";

const formSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters").max(100),
  phone: z.string().min(10, "Phone number must be at least 10 digits").max(15),
  email: z.string().email("Invalid email address"),
});

interface PaymentFormProps {
  onSubmit: (data: { fullName: string; phone: string; email: string }) => void;
  defaultEmail?: string;
  defaultName?: string;
}

export const PaymentForm = ({ onSubmit, defaultEmail = "", defaultName = "" }: PaymentFormProps) => {
  const [formData, setFormData] = useState({
    fullName: defaultName,
    phone: "",
    email: defaultEmail,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const result = formSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    onSubmit(formData);
  };

  const inputClasses = (hasError: boolean, isFocused: boolean) =>
    `w-full h-14 bg-secondary/40 border-2 ${
      hasError 
        ? "border-red-500/60" 
        : isFocused 
          ? "border-teal/60 shadow-lg shadow-teal/10" 
          : "border-border/50"
    } rounded-2xl px-4 pl-14 text-foreground placeholder:text-muted-foreground/60 focus:border-teal focus:ring-0 transition-all duration-300 text-base font-medium`;

  const features = [
    { icon: Zap, text: "Instant Processing", color: "text-gold" },
    { icon: Shield, text: "Bank-Grade Security", color: "text-teal" },
    { icon: Award, text: "Verified Platform", color: "text-violet" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      {/* Premium Header Card */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="relative overflow-hidden rounded-2xl p-5 border border-violet/30"
        style={{
          background: "linear-gradient(135deg, hsla(var(--violet), 0.12), hsla(var(--magenta), 0.08))",
        }}
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-violet/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-magenta/15 rounded-full blur-2xl" />
        
        <div className="relative">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-2 rounded-xl bg-teal/20">
              <TrendingUp className="w-5 h-5 text-teal" />
            </div>
            <div>
              <h3 className="font-bold text-foreground">ZFC Investment Package</h3>
              <p className="text-xs text-muted-foreground">Limited time offer</p>
            </div>
          </div>
          
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-foreground">₦5,700</span>
            <span className="text-sm text-muted-foreground line-through">₦7,500</span>
            <span className="px-2 py-0.5 rounded-full bg-teal/20 text-teal text-xs font-bold">
              24% OFF
            </span>
          </div>
          
          <p className="text-sm text-muted-foreground mt-2">
            Get <span className="text-teal font-semibold">180,000 ZFC</span> credited instantly
          </p>
        </div>
      </motion.div>

      {/* Features Strip */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-3 gap-2"
      >
        {features.map((feature, i) => (
          <motion.div
            key={feature.text}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 + i * 0.1 }}
            className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-secondary/30 border border-border/30"
          >
            <feature.icon className={`w-4 h-4 ${feature.color}`} />
            <span className="text-[10px] text-muted-foreground font-medium text-center leading-tight">
              {feature.text}
            </span>
          </motion.div>
        ))}
      </motion.div>

      {/* Form */}
      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        onSubmit={handleSubmit}
        className="space-y-5"
      >
        {/* Section Header */}
        <div className="flex items-center gap-2 pb-2 border-b border-border/30">
          <Lock className="w-4 h-4 text-muted-foreground" />
          <span className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">
            Secure Payment Details
          </span>
        </div>

        {/* Full Name */}
        <motion.div 
          className="space-y-2"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-2">
            Full Name
            {formData.fullName.length >= 2 && !errors.fullName && (
              <CheckCircle className="w-3 h-3 text-teal" />
            )}
          </label>
          <div className="relative">
            <div className={`absolute left-4 top-1/2 -translate-y-1/2 p-1.5 rounded-lg ${focusedField === 'fullName' ? 'bg-teal/20' : 'bg-secondary/50'} transition-colors`}>
              <User className={`w-4 h-4 ${focusedField === 'fullName' ? 'text-teal' : 'text-muted-foreground'} transition-colors`} />
            </div>
            <Input
              type="text"
              placeholder="Enter your full name"
              value={formData.fullName}
              onChange={(e) => handleChange("fullName", e.target.value)}
              onFocus={() => setFocusedField('fullName')}
              onBlur={() => setFocusedField(null)}
              className={inputClasses(!!errors.fullName, focusedField === 'fullName')}
            />
          </div>
          {errors.fullName && (
            <motion.p 
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xs text-red-400 flex items-center gap-1"
            >
              <span className="w-1 h-1 rounded-full bg-red-400" />
              {errors.fullName}
            </motion.p>
          )}
        </motion.div>

        {/* Phone Number */}
        <motion.div 
          className="space-y-2"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
        >
          <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-2">
            Phone Number
            {formData.phone.length >= 10 && !errors.phone && (
              <CheckCircle className="w-3 h-3 text-teal" />
            )}
          </label>
          <div className="relative">
            <div className={`absolute left-4 top-1/2 -translate-y-1/2 p-1.5 rounded-lg ${focusedField === 'phone' ? 'bg-teal/20' : 'bg-secondary/50'} transition-colors`}>
              <Phone className={`w-4 h-4 ${focusedField === 'phone' ? 'text-teal' : 'text-muted-foreground'} transition-colors`} />
            </div>
            <Input
              type="tel"
              placeholder="Enter your phone number"
              value={formData.phone}
              onChange={(e) => handleChange("phone", e.target.value)}
              onFocus={() => setFocusedField('phone')}
              onBlur={() => setFocusedField(null)}
              className={inputClasses(!!errors.phone, focusedField === 'phone')}
            />
          </div>
          {errors.phone && (
            <motion.p 
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xs text-red-400 flex items-center gap-1"
            >
              <span className="w-1 h-1 rounded-full bg-red-400" />
              {errors.phone}
            </motion.p>
          )}
        </motion.div>

        {/* Email */}
        <motion.div 
          className="space-y-2"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.7 }}
        >
          <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-2">
            Email Address
            {formData.email.includes('@') && !errors.email && (
              <CheckCircle className="w-3 h-3 text-teal" />
            )}
          </label>
          <div className="relative">
            <div className={`absolute left-4 top-1/2 -translate-y-1/2 p-1.5 rounded-lg ${focusedField === 'email' ? 'bg-teal/20' : 'bg-secondary/50'} transition-colors`}>
              <Mail className={`w-4 h-4 ${focusedField === 'email' ? 'text-teal' : 'text-muted-foreground'} transition-colors`} />
            </div>
            <Input
              type="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
              onFocus={() => setFocusedField('email')}
              onBlur={() => setFocusedField(null)}
              className={inputClasses(!!errors.email, focusedField === 'email')}
            />
          </div>
          {errors.email && (
            <motion.p 
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xs text-red-400 flex items-center gap-1"
            >
              <span className="w-1 h-1 rounded-full bg-red-400" />
              {errors.email}
            </motion.p>
          )}
        </motion.div>

        {/* Submit Button */}
        <motion.button
          type="submit"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          whileHover={{ scale: 1.02, boxShadow: "0 20px 40px hsla(var(--violet), 0.35)" }}
          whileTap={{ scale: 0.98 }}
          className="relative w-full py-4 mt-6 font-bold text-white rounded-2xl overflow-hidden transition-all duration-300"
          style={{
            background: "linear-gradient(135deg, hsl(var(--violet)), hsl(var(--magenta)))",
            boxShadow: "0 15px 35px hsla(var(--violet), 0.3)",
          }}
        >
          {/* Shimmer effect */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
            initial={{ x: "-100%" }}
            animate={{ x: "100%" }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 2 }}
          />
          
          <span className="relative flex items-center justify-center gap-3 text-base">
            Proceed to Payment
            <motion.span
              animate={{ x: [0, 5, 0] }}
              transition={{ duration: 1.2, repeat: Infinity }}
            >
              <ArrowRight className="w-5 h-5" />
            </motion.span>
          </span>
        </motion.button>

        {/* Trust Indicators */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="flex items-center justify-center gap-4 pt-4"
        >
          <div className="flex items-center gap-1.5 text-muted-foreground/60">
            <Shield className="w-3.5 h-3.5" />
            <span className="text-[10px] font-medium">SSL Secured</span>
          </div>
          <div className="w-1 h-1 rounded-full bg-muted-foreground/30" />
          <div className="flex items-center gap-1.5 text-muted-foreground/60">
            <Lock className="w-3.5 h-3.5" />
            <span className="text-[10px] font-medium">256-bit Encryption</span>
          </div>
        </motion.div>
      </motion.form>
    </motion.div>
  );
};
