import { Twitter, Linkedin, Github } from "lucide-react";

const SocialLinks = () => (
  <div className="flex gap-6 mt-16">
    <a href="#" className="text-gray-400 hover:text-white transition-colors">
      <Twitter size={24} />
    </a>
    <a href="#" className="text-gray-400 hover:text-white transition-colors">
      <Linkedin size={24} />
    </a>
    <a href="#" className="text-gray-400 hover:text-white transition-colors">
      <Github size={24} />
    </a>
  </div>
);

export default SocialLinks;
