import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { clientStorage } from "@/lib/localStorage";
import { Mail, MessageSquare, Send, CheckCircle2, Loader2 } from "lucide-react";
import { useState } from "react";

const contactFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

type ContactFormData = z.infer<typeof contactFormSchema>;

export default function Contact() {
  const [showSuccess, setShowSuccess] = useState(false);
  const { toast } = useToast();

  const form = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: "",
      email: "",
      message: "",
    },
  });

  const submitMutation = useMutation({
    mutationFn: async (data: ContactFormData) => {
      return clientStorage.createContactMessage(data);
    },
    onSuccess: () => {
      setShowSuccess(true);
      form.reset();
      setTimeout(() => setShowSuccess(false), 5000);
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to Send Message",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ContactFormData) => {
    submitMutation.mutate(data);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen py-12"
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="font-serif text-5xl md:text-6xl font-bold text-foreground mb-6" data-testid="text-contact-title">
            Get in Touch
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Have questions, suggestions, or want to partner with us? We'd love to hear from you.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card className="p-8">
              {showSuccess ? (
                <div className="text-center py-12">
                  <div className="w-20 h-20 rounded-full bg-primary/10 mx-auto mb-6 flex items-center justify-center">
                    <CheckCircle2 className="w-10 h-10 text-primary" />
                  </div>
                  <h3 className="font-serif text-3xl font-bold text-foreground mb-3">
                    Message Sent!
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    Thank you for reaching out. We'll get back to you as soon as possible.
                  </p>
                  <Button onClick={() => setShowSuccess(false)} data-testid="button-send-another">
                    Send Another Message
                  </Button>
                </div>
              ) : (
                <>
                  <div className="mb-8">
                    <h2 className="font-serif text-3xl font-bold text-foreground mb-2">
                      Send Us a Message
                    </h2>
                    <p className="text-muted-foreground">
                      Fill out the form below and we'll respond within 24-48 hours
                    </p>
                  </div>

                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Name *</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Your full name" 
                                {...field}
                                data-testid="input-name"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email *</FormLabel>
                            <FormControl>
                              <Input 
                                type="email"
                                placeholder="your.email@example.com" 
                                {...field}
                                data-testid="input-email"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="message"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Message *</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Tell us how we can help..."
                                className="min-h-40"
                                {...field}
                                data-testid="input-message"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button 
                        type="submit" 
                        size="lg"
                        disabled={submitMutation.isPending}
                        className="w-full"
                        data-testid="button-submit"
                      >
                        {submitMutation.isPending ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Sending...
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4 mr-2" />
                            Send Message
                          </>
                        )}
                      </Button>
                    </form>
                  </Form>
                </>
              )}
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="p-6">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Mail className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-foreground mb-2">Email Us</h3>
                  <p className="text-muted-foreground text-sm mb-2">
                    For general inquiries and support
                  </p>
                  <a 
                    href="mailto:lingualivehq@gmail.com
" 
                    className="text-primary hover:underline"
                    data-testid="link-email"
                  >
                    lingualivehq@gmail.com

                  </a>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <MessageSquare className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-foreground mb-2">Partnerships</h3>
                  <p className="text-muted-foreground text-sm mb-2">
                    Interested in collaborating with us?
                  </p>
                  <a 
                    href="mailto:lingualivehq@gmail.com
" 
                    className="text-primary hover:underline"
                    data-testid="link-partnerships"
                  >
lingualivehq@gmail.com
</a>
                </div>
              </div>
            </Card>

            
          </div>
        </div>
      </div>
    </motion.div>
  );
}
