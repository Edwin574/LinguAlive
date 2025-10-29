import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Mic, FileText, Upload, Database, ArrowDown } from "lucide-react";
import heroImage from "@assets/generated_images/Ogiek_elder_storytelling_hero_c69cc017.png";
import { motion } from "framer-motion";

export default function Home() {
  const scrollToGetInvolved = () => {
    const element = document.getElementById('get-involved');
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  const steps = [
    {
      icon: Mic,
      title: "Record",
      description: "Share your voice by recording words, songs, proverbs, or stories in Ogiek"
    },
    {
      icon: FileText,
      title: "Annotate",
      description: "Add transcriptions and context to help preserve the language accurately"
    },
    {
      icon: Upload,
      title: "Submit",
      description: "Upload your recording along with speaker metadata for our community archive"
    },
    {
      icon: Database,
      title: "Preserve",
      description: "Your contribution joins our growing database, helping future generations"
    }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen"
    >
      <section className="relative h-[90vh] min-h-[600px] flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroImage})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-foreground/70 via-foreground/60 to-foreground/70" />
        
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="font-serif text-5xl md:text-7xl font-bold text-primary-foreground mb-6" data-testid="text-hero-title">
            Preserving Ogiek Through Data & Voice
          </h1>
          <p className="text-xl md:text-2xl text-primary-foreground/90 mb-8 max-w-3xl mx-auto">
            Join our community in documenting and preserving the Ogiek language for future generations through voice recordings and collaborative analysis.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              size="lg"
              className="bg-primary/90 backdrop-blur-md hover:bg-primary text-primary-foreground px-8 py-6 text-lg rounded-full"
              onClick={scrollToGetInvolved}
              data-testid="button-get-involved"
            >
              Get Involved
              <ArrowDown className="ml-2 w-5 h-5" />
            </Button>
            <Link href="/listen">
              <Button 
                size="lg"
                variant="outline"
                className="bg-background/10 backdrop-blur-md border-2 border-primary-foreground/30 text-primary-foreground hover:bg-background/20 px-8 py-6 text-lg rounded-full"
                data-testid="button-explore-recordings"
              >
                Explore Recordings
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-20 bg-background" id="get-involved">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-6">
              Why LinguAlive Matters
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
              Indigenous languages worldwide are disappearing at an alarming rate. The Ogiek language, 
              spoken by communities in Kenya, faces the same threat. LinguAlive empowers communities 
              to document, preserve, and celebrate their linguistic heritage through technology.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="font-serif text-3xl font-bold text-foreground mb-4">Our Mission</h3>
              <p className="text-muted-foreground mb-6">
                We're building a comprehensive digital archive of the Ogiek language through 
                community-driven voice recordings. Every contribution helps create a lasting 
                resource for language learners, researchers, and future generations.
              </p>
              <Link href="/contribute">
                <Button size="lg" className="rounded-full" data-testid="button-start-contributing">
                  Start Contributing
                </Button>
              </Link>
            </div>
            <div className="relative">
              <img 
                src={heroImage} 
                alt="Ogiek community member" 
                className="rounded-2xl shadow-lg w-full"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-6">
              How It Works
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Contributing to language preservation is simple and accessible to everyone
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step, index) => (
              <Card key={index} className="p-8 text-center hover-elevate" data-testid={`card-step-${index + 1}`}>
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-6">
                  <step.icon className="w-8 h-8" />
                </div>
                <h3 className="font-bold text-xl text-foreground mb-3">{step.title}</h3>
                <p className="text-muted-foreground text-sm">{step.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-serif text-4xl md:text-5xl font-bold mb-6">
            Ready to Make a Difference?
          </h2>
          <p className="text-xl mb-8 text-primary-foreground/90">
            Your voice matters. Join our community in preserving the Ogiek language today.
          </p>
          <Link href="/contribute">
            <Button 
              size="lg" 
              variant="outline"
              className="bg-primary-foreground text-primary border-2 border-primary-foreground hover:bg-primary-foreground/90 px-8 py-6 text-lg rounded-full"
              data-testid="button-contribute-now"
            >
              Contribute Now
            </Button>
          </Link>
        </div>
      </section>
    </motion.div>
  );
}
