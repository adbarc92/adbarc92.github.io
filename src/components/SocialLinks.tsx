import { Twitter, Linkedin, Github } from 'lucide-react';

const SocialLinks = () => (
  <div className="bg-slate-900 w-full py-4 flex gap-6 justify-around">
    <a
      target="_blank"
      rel="noopener noreferrer"
      href="https://x.com/abarc92"
      className="text-gray-400 hover:text-white transition-colors"
    >
      <Twitter size={24} />
    </a>
    <a
      target="_blank"
      rel="noopener noreferrer"
      href="https://www.linkedin.com/in/alex-barclay/"
      className="text-gray-400 hover:text-white transition-colors"
    >
      <Linkedin size={24} />
    </a>
    <a
      target="_blank"
      rel="noopener noreferrer"
      href="https://github.com/adbarc92"
      className="text-gray-400 hover:text-white transition-colors"
    >
      <Github size={24} />
    </a>
  </div>
);

export default SocialLinks;
