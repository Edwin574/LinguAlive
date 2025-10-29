import { Card } from "@/components/ui/card";
import { Users, Target, Heart, Globe } from "lucide-react";
import communityImage from "@assets/generated_images/Ogiek_community_gathering_28aea73e.png";
import { motion } from "framer-motion";

export default function About() {
  const team = [
    {
      name: "Kathryn Nkini",
      title: "Project Lead",
      linkedin: "https://www.linkedin.com/in/katherin-nkini-n003/",
      image: "https://media.licdn.com/dms/image/v2/D4D03AQExAbxGyzrrvQ/profile-displayphoto-shrink_400_400/profile-displayphoto-shrink_400_400/0/1723311778170?e=1763596800&v=beta&t=bK_YEJWTWSYhLkhPzKgXQ5atfr2ykuTbLNA8w4FS8c0"
    },
    {
      name: "Abigael Mwangi",
      title: "Cloud Storage",
      linkedin: "",
      image: ""
    },
    {
      name: "Andrew Kiptoo",
      title: "Database Management",
      linkedin: "",
      image: ""
    },
    {
      name: "Edwin Owino",
      title: "Data Cleaning",
      linkedin: "https://www.linkedin.com/in/edwinowino/",
      image: "https://media.licdn.com/dms/image/v2/D4D03AQHF8NIt4LSa9A/profile-displayphoto-scale_400_400/B4DZoaiK1.JcAg-/0/1761381811668?e=1763596800&v=beta&t=6fUDJs7M_MdbFqMjSjQLOSh-89UoZRBhjzqZxXfwYkk"
    }
  ];

  const values = [
    {
      icon: Users,
      title: "Community-Driven",
      description: "Built by and for the Ogiek community with respect and collaboration at our core"
    },
    {
      icon: Target,
      title: "Data-Driven",
      description: "Using modern technology to analyze and preserve linguistic patterns"
    },
    {
      icon: Heart,
      title: "Culturally Respectful",
      description: "Honoring Ogiek traditions and ensuring authentic representation"
    },
    {
      icon: Globe,
      title: "Open & Accessible",
      description: "Making language preservation accessible to all, regardless of technical expertise"
    }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen py-12"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="font-serif text-5xl md:text-6xl font-bold text-foreground mb-6" data-testid="text-about-title">
            About LinguAlive
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Preserving indigenous languages through community collaboration and technology
          </p>
        </div>

        <section className="mb-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="font-serif text-4xl font-bold text-foreground mb-6">
                Our Story
              </h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  LinguAlive was born from a simple yet urgent realization: indigenous languages 
                  around the world are disappearing at an unprecedented rate. The Ogiek people, 
                  indigenous to the forests of Kenya, have maintained their unique language and 
                  cultural practices for generations.
                </p>
                <p>
                  However, like many indigenous communities, the Ogiek face challenges in 
                  preserving their linguistic heritage as younger generations increasingly 
                  adopt dominant languages. We created LinguAlive to empower the Ogiek 
                  community to document, preserve, and celebrate their language.
                </p>
                <p>
                  Through voice recordings, transcriptions, and community participation, 
                  we're building a comprehensive digital archive that will serve as a 
                  resource for current speakers, language learners, researchers, and 
                  future generations.
                </p>
              </div>
            </div>
            <div>
              <img 
                src={communityImage} 
                alt="Ogiek community gathering" 
                className="rounded-2xl shadow-lg w-full"
              />
            </div>
          </div>
        </section>

        <section className="mb-20">
          <h2 className="font-serif text-4xl font-bold text-foreground mb-12 text-center">
            The Challenge We're Addressing
          </h2>
          <Card className="p-8 md:p-12 bg-card">
            <div className="space-y-6 text-muted-foreground">
              <p className="text-lg">
                <span className="font-semibold text-foreground">Language Loss:</span> UNESCO 
                estimates that one language dies every two weeks. Indigenous languages are 
                particularly vulnerable, with many having few remaining fluent speakers.
              </p>
              <p className="text-lg">
                <span className="font-semibold text-foreground">Limited Documentation:</span> Many 
                indigenous languages lack comprehensive written records, making oral transmission 
                the primary means of preservation.
              </p>
              <p className="text-lg">
                <span className="font-semibold text-foreground">Accessibility Gap:</span> Traditional 
                language preservation methods often require specialized expertise and resources 
                that aren't readily available to indigenous communities.
              </p>
              <p className="text-lg font-semibold text-primary">
                LinguAlive bridges this gap by providing an accessible, community-driven platform 
                that anyone can use to contribute to language preservation.
              </p>
            </div>
          </Card>
        </section>

        <section className="mb-20">
          <h2 className="font-serif text-4xl font-bold text-foreground mb-12 text-center">
            Our Values
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {values.map((value, index) => (
              <Card key={index} className="p-8 hover-elevate" data-testid={`card-value-${index + 1}`}>
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <value.icon className="w-6 h-6 text-primary" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-bold text-xl text-foreground mb-2">{value.title}</h3>
                    <p className="text-muted-foreground">{value.description}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>

        <section>
          <h2 className="font-serif text-4xl font-bold text-foreground mb-12 text-center">
            Our Team
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <Card key={index} className="p-8 text-center hover-elevate" data-testid={`card-team-${index + 1}`}>
                {member.image ? (
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-24 h-24 rounded-full object-cover mx-auto mb-6"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-primary/10 mx-auto mb-6 flex items-center justify-center">
                    <span className="text-3xl font-serif font-bold text-primary">
                      {member.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                )}
                {member.linkedin ? (
                  <a
                    href={member.linkedin}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="inline-block"
                  >
                    <h3 className="font-bold text-xl text-foreground mb-1 underline decoration-muted-foreground/40 underline-offset-4">
                      {member.name}
                    </h3>
                  </a>
                ) : (
                  <h3 className="font-bold text-xl text-foreground mb-1">{member.name}</h3>
                )}
                <p className="text-primary font-medium">{member.title}</p>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </motion.div>
  );
}
