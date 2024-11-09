import {
  Twitter,
  Facebook,
  Linkedin,
  Github,
  Dribbble,
  Instagram,
} from "lucide-react";

const SocialLinks = () => (
  <div className="flex gap-6 mt-16">
    <a href="#" className="text-gray-400 hover:text-white transition-colors">
      <Twitter size={24} />
    </a>
    <a href="#" className="text-gray-400 hover:text-white transition-colors">
      <Facebook size={24} />
    </a>
    <a href="#" className="text-gray-400 hover:text-white transition-colors">
      <Linkedin size={24} />
    </a>
    <a href="#" className="text-gray-400 hover:text-white transition-colors">
      <Github size={24} />
    </a>
    <a href="#" className="text-gray-400 hover:text-white transition-colors">
      <Dribbble size={24} />
    </a>
    <a href="#" className="text-gray-400 hover:text-white transition-colors">
      <Instagram size={24} />
    </a>
  </div>
);

export default SocialLinks;
