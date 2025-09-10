import { useContext } from "react";
import { VoiceStreamContext } from "@/providers/VoiceStream";

export function useVoiceStreamWithCheck() {
  const context = useContext(VoiceStreamContext);
  
  if (context === undefined) {
    throw new Error(
      "VoiceStreamProvider is not available. Please wrap your component with VoiceStreamProvider:\n\n" +
      "import { VoiceStreamProvider } from '@/providers/VoiceStream';\n\n" +
      "<VoiceStreamProvider>\n" +
      "  <YourComponent />\n" +
      "</VoiceStreamProvider>\n\n" +
      "Or use the wrapper component:\n" +
      "import { VoiceButtonWithProvider } from '@/components/voice/VoiceButtonWithProvider';\n\n" +
      "<VoiceButtonWithProvider />"
    );
  }
  
  return context;
} 