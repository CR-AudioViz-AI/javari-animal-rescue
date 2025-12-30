'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, Dog, Cat, Search, Camera, MapPin, Calendar, Users, FileText, DollarSign, Share2, CheckCircle2, ChevronRight, Menu, X, ArrowRight, Sparkles } from 'lucide-react';

const STATS = [
  { value: '6.3M', label: 'Shelter Animals/Year', icon: Heart },
  { value: '3,500+', label: 'U.S. Shelters', icon: MapPin },
  { value: '4.1M', label: 'Adopted Annually', icon: CheckCircle2 },
  { value: '$0', label: 'Platform Cost', icon: DollarSign },
];

const FEATURES = [
  { icon: Camera, title: 'AI Pet Profiles', description: 'Generate compelling, adoption-ready profiles with AI-enhanced photos and descriptions.', color: 'from-orange-500 to-amber-600', features: ['Photo Enhancement', 'Bio Generator', 'Video Stories'] },
  { icon: Search, title: 'Smart Matching', description: 'Connect adopters with their perfect pet based on lifestyle and compatibility.', color: 'from-blue-500 to-cyan-600', features: ['Lifestyle Quiz', 'Breed Matching', 'Compatibility Score'] },
  { icon: Calendar, title: 'Adoption Management', description: 'Streamline the adoption process from application to follow-up.', color: 'from-green-500 to-emerald-600', features: ['Applications', 'Scheduling', 'Contracts'] },
  { icon: Users, title: 'Volunteer Coordination', description: 'Manage volunteers, fosters, and transport networks easily.', color: 'from-purple-500 to-violet-600', features: ['Volunteer Portal', 'Foster Management', 'Transport'] },
  { icon: Share2, title: 'Social Amplification', description: 'Auto-share pets across social media to find homes faster.', color: 'from-pink-500 to-rose-600', features: ['Auto-Posting', 'Urgent Shares', 'Success Stories'] },
  { icon: FileText, title: 'Grant & Reporting', description: 'Simplified grant applications and outcome tracking.', color: 'from-indigo-500 to-blue-600', features: ['Grant Templates', 'Impact Reports', 'Donor Management'] },
];

export default function AnimalRescuePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-orange-950/10 to-slate-950">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-950/95 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-600 rounded-lg flex items-center justify-center">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="font-bold text-white text-lg">Animal Rescue Hub</span>
                <span className="text-orange-400 text-xs block -mt-1">by Javari AI</span>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-6">
              <a href="#features" className="text-gray-300 hover:text-white">Features</a>
              <a href="#shelters" className="text-gray-300 hover:text-white">For Shelters</a>
              <a href="/signup" className="px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-600 text-white font-medium rounded-lg">Join Free</a>
            </div>
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 text-gray-300">
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </nav>

      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500/20 border border-orange-500/30 rounded-full text-sm text-orange-300 mb-8">
            <Sparkles className="w-4 h-4" />
            <span>A CR AudioViz AI Social Impact Initiative</span>
          </motion.div>

          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6">
            Every Pet Deserves<br />
            <span className="bg-gradient-to-r from-orange-400 via-amber-400 to-yellow-400 bg-clip-text text-transparent">A Forever Home</span>
          </motion.h1>

          <motion.p initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-xl text-gray-300 max-w-3xl mx-auto mb-10">
            Free tools for shelters and rescues to manage adoptions, coordinate volunteers, and connect pets with loving families.
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <a href="/signup?type=shelter" className="group px-8 py-4 bg-gradient-to-r from-orange-500 to-amber-600 text-white font-semibold rounded-xl flex items-center gap-2">
              Register Your Shelter <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </a>
            <a href="/adopt" className="px-8 py-4 border border-white/20 text-white font-semibold rounded-xl hover:bg-white/5 flex items-center gap-2">
              <Search className="w-5 h-5" /> Find a Pet
            </a>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {STATS.map((stat, i) => (
              <div key={i} className="p-4 bg-white/5 border border-white/10 rounded-xl">
                <stat.icon className="w-6 h-6 text-orange-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">{stat.value}</div>
                <div className="text-sm text-gray-400">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      <section id="features" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Tools That Save Lives</h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">Everything shelters need to find forever homes for every pet.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((feature, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="group p-6 bg-white/5 border border-white/10 rounded-2xl hover:border-orange-500/50 transition-all">
                <div className={`inline-flex p-3 rounded-xl bg-gradient-to-r ${feature.color} mb-4`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-gray-400 mb-4">{feature.description}</p>
                <div className="flex flex-wrap gap-2">
                  {feature.features.map((f, j) => (<span key={j} className="px-2 py-1 bg-white/5 text-xs text-gray-300 rounded">{f}</span>))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Join the Movement</h2>
          <p className="text-xl text-gray-400 mb-8">Whether you run a shelter, volunteer, or want to adopt, there's a place for you.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a href="/signup?type=shelter" className="px-8 py-4 bg-gradient-to-r from-orange-500 to-amber-600 text-white font-semibold rounded-xl flex items-center gap-2">
              Register Shelter/Rescue <ChevronRight className="w-5 h-5" />
            </a>
            <a href="/signup?type=adopter" className="px-8 py-4 border border-white/20 text-white font-semibold rounded-xl hover:bg-white/5">Create Adopter Profile</a>
          </div>
        </div>
      </section>

      <footer className="py-12 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Heart className="w-6 h-6 text-orange-400" />
              <span className="text-white font-semibold">Animal Rescue Hub</span>
              <span className="text-gray-500">by CR AudioViz AI</span>
            </div>
            <div className="text-sm text-gray-400">© {new Date().getFullYear()} CR AudioViz AI, LLC.</div>
          </div>
        </div>
      </footer>
    </div>
  );
}
