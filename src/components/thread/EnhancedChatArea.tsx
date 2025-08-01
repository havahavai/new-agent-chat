"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { StickToBottom, useStickToBottomContext } from "use-stick-to-bottom";
import { Button } from "@/components/ui/button";
import { useStreamContext } from "@/providers/Stream";
import { useNonAgentFlow } from "@/providers/NonAgentFlowContext";
import { useWidgetState } from "@/providers/WidgetStateContext";
import { useLayoutState } from "@/providers/LayoutStateContext";
import { useAdvancedResponsive } from "@/hooks/useAdvancedResponsive";
import { cn } from "@/lib/utils";
import { Send, Plus, LoaderCircle } from "lucide-react";
import { AssistantMessage } from "./messages/ai";
import { HumanMessage } from "./messages/human";
import { GenericInterruptView } from "./messages/generic-interrupt";
import { NonAgentFlowReopenButton } from "./NonAgentFlowReopenButton";
import { useFileUpload } from "@/hooks/use-file-upload";
import { Label } from "@/components/ui/label";
import { ContentBlocksPreview } from "./ContentBlocksPreview";

interface EnhancedChatAreaProps {
  className?: string;
}

// StickyToBottomContent component (copied from original implementation)
function StickyToBottomContent(props: {
  content: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  contentClassName?: string;
}) {
  const context = useStickToBottomContext();
  return (
    <div
      ref={context.scrollRef}
      style={{ width: "100%", height: "100%" }}
      className={cn("flex h-full flex-col", props.className)}
    >
      <div
        ref={context.contentRef}
        className={cn("flex-1 overflow-y-auto", props.contentClassName)}
      >
        {props.content}
      </div>
      {props.footer && <div className="flex-shrink-0">{props.footer}</div>}
    </div>
  );
}

export function EnhancedChatArea({ className }: EnhancedChatAreaProps) {
  const stream = useStreamContext();
  const { messages, values, isLoading, error, interrupt } = stream;
  const { shouldShowReopenButton } = useNonAgentFlow();
  const { activeWidgets } = useWidgetState();
  const { isMobile } = useAdvancedResponsive();
  const { layout } = useLayoutState();

  const [messageText, setMessageText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [firstTokenReceived, setFirstTokenReceived] = useState(false);

  const {
    handleFileUpload,
    contentBlocks,
    removeBlock,
    resetBlocks,
    dropRef,
    dragOver,
    handlePaste,
  } = useFileUpload();

  // Check if chat has started
  const chatStarted = messages.length > 0 || isLoading;

  // Track first token received
  useEffect(() => {
    if (isLoading && !firstTokenReceived) {
      setFirstTokenReceived(true);
    }
  }, [isLoading, firstTokenReceived]);

  // Handle message submission
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!messageText.trim() || isSubmitting || isLoading) return;

      setIsSubmitting(true);
      try {
        // Create message content with text and file blocks
        const messageContent = [
          { type: "text" as const, text: messageText },
          ...contentBlocks.map((block) => ({
            type: "image_url" as const,
            image_url: {
              url: block.data,
              detail: "auto" as const,
            },
          })),
        ];

        // Submit the message using stream context
        await stream.submit({
          messages: [
            {
              type: "human",
              content: messageContent as any,
            },
          ],
        });

        setMessageText("");
        resetBlocks();
      } catch (error) {
        console.error("Failed to send message:", error);
      } finally {
        setIsSubmitting(false);
      }
    },
    [messageText, isSubmitting, isLoading, contentBlocks, resetBlocks, stream],
  );

  // Handle regenerate
  const handleRegenerate = useCallback(async () => {
    if (isLoading) return;
    try {
      stream.submit(undefined, { checkpoint: (values as any)?.checkpoint });
    } catch (error) {
      console.error("Failed to regenerate:", error);
    }
  }, [isLoading, stream, values]);

  // Check for displayable messages
  const isDisplayableMessage = (m: any) => {
    if (m.id?.startsWith("DO_NOT_RENDER_")) return false;
    if (
      (m.type === "ai" &&
        (!m.content ||
          (Array.isArray(m.content) && m.content.length === 0) ||
          m.content === "") &&
        m.tool_calls &&
        m.tool_calls.length > 0) ||
      m.type === "tool"
    ) {
      return false;
    }
    return true;
  };

  const hasNoAIOrToolMessages = !messages.find(
    (m) => m.type === "ai" || m.type === "tool",
  );

  return (
    <div className={cn("flex h-full flex-col", className)}>
      <StickToBottom className="relative flex-1 overflow-hidden">
        <StickyToBottomContent
          className={cn(
            "absolute inset-0 overflow-y-scroll px-4 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-track]:bg-transparent",
            !chatStarted && "flex flex-col items-center justify-center",
            chatStarted && "grid grid-rows-[1fr_auto]",
          )}
          contentClassName={cn(
            "max-w-3xl mx-auto flex flex-col gap-4 w-full",
            !chatStarted && "pt-0 pb-0",
            chatStarted && "pt-8 pb-16",
          )}
          content={
            <>
              {messages.filter(isDisplayableMessage).map((message, index) =>
                message.type === "human" ? (
                  <HumanMessage
                    key={message.id || `${message.type}-${index}`}
                    message={message}
                    isLoading={isLoading}
                  />
                ) : (
                  <AssistantMessage
                    key={message.id || `${message.type}-${index}`}
                    message={message}
                    isLoading={isLoading}
                    handleRegenerate={handleRegenerate}
                  />
                ),
              )}
              {/* Special rendering case where there are no AI/tool messages, but there is an interrupt. */}
              {hasNoAIOrToolMessages && !!stream.interrupt && (
                <AssistantMessage
                  key="interrupt-msg"
                  message={undefined}
                  isLoading={isLoading}
                  handleRegenerate={handleRegenerate}
                />
              )}
              {isLoading && (
                <div className="flex items-center space-x-3 rounded-lg bg-gray-50 p-4">
                  <div className="flex space-x-1">
                    <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400"></div>
                    <div
                      className="h-2 w-2 animate-bounce rounded-full bg-gray-400"
                      style={{ animationDelay: "0.1s" }}
                    ></div>
                    <div
                      className="h-2 w-2 animate-bounce rounded-full bg-gray-400"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-600">
                    AI is thinking...
                  </span>
                </div>
              )}
              {/* Always render the interrupt widget at the end if present */}
              {stream.interrupt && (
                <GenericInterruptView
                  interrupt={stream.interrupt.value ?? {}}
                />
              )}
            </>
          }
          footer={
            <div
              className={cn(
                "sticky bottom-0 flex flex-col items-center gap-8 bg-white",
                !chatStarted && "min-h-[60vh] justify-center",
              )}
            >
              {!chatStarted && (
                <div className="mb-8 flex items-center gap-3">
                  <div className="text-center">
                    <h1 className="text-6xl font-bold">
                      <span className="text-gray-900">flyo.</span>
                      <span className="text-blue-600">ai</span>
                    </h1>
                    <p className="mt-3 text-lg text-gray-500">
                      Your AI Assistant
                    </p>
                  </div>
                </div>
              )}

              <div
                ref={dropRef}
                className={cn(
                  "bg-muted relative z-10 mx-auto w-full max-w-3xl rounded-2xl shadow-xs transition-all",
                  dragOver
                    ? "border-primary border-2 border-dotted"
                    : "border border-solid",
                  !chatStarted && "mb-0",
                  chatStarted && "mb-8",
                )}
              >
                <form
                  onSubmit={handleSubmit}
                  className="mx-auto grid max-w-3xl grid-rows-[1fr_auto] gap-2"
                >
                  <ContentBlocksPreview
                    blocks={contentBlocks}
                    onRemove={removeBlock}
                  />
                  <textarea
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    onPaste={handlePaste}
                    onKeyDown={(e) => {
                      if (
                        e.key === "Enter" &&
                        !e.shiftKey &&
                        !e.metaKey &&
                        !e.nativeEvent.isComposing
                      ) {
                        e.preventDefault();
                        const el = e.target as HTMLElement | undefined;
                        const form = el?.closest("form");
                        form?.requestSubmit();
                      }
                    }}
                    placeholder="Type your message..."
                    className="field-sizing-content resize-none border-none bg-transparent p-3.5 pb-0 shadow-none ring-0 outline-none focus:ring-0 focus:outline-none"
                  />

                  <div className="flex items-center gap-6 p-2 pt-4">
                    <Label
                      htmlFor="file-input"
                      className="flex cursor-pointer items-center gap-2"
                    >
                      <Plus className="size-5 text-gray-600" />
                      <span className="text-sm text-gray-600">
                        Upload PDF, Image, or Video
                      </span>
                    </Label>
                    <input
                      id="file-input"
                      type="file"
                      onChange={handleFileUpload}
                      multiple
                      accept="image/jpeg,image/png,image/gif,image/webp,application/pdf"
                      className="hidden"
                    />
                    {stream.isLoading ? (
                      <Button
                        key="stop"
                        onClick={() => stream.stop?.()}
                        className="ml-auto"
                      >
                        <LoaderCircle className="h-4 w-4 animate-spin" />
                        Cancel
                      </Button>
                    ) : (
                      <Button
                        type="submit"
                        className="ml-auto shadow-md transition-all"
                        disabled={
                          isLoading ||
                          (!messageText.trim() && contentBlocks.length === 0)
                        }
                      >
                        Send
                      </Button>
                    )}
                  </div>
                </form>
              </div>
            </div>
          }
        />
      </StickToBottom>

      {/* Non-agent flow reopen button */}
      {shouldShowReopenButton && <NonAgentFlowReopenButton />}
    </div>
  );
}
