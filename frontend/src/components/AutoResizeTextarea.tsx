import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { useEffect, useRef } from 'react';

interface Props extends React.ComponentProps<'textarea'> {
  maxHeight?: number;
  placeholder?: string;
  onPaste?: (event: any) => void;
  onEnter?: (event: React.KeyboardEvent<HTMLTextAreaElement>) => void;
}

const AutoResizeTextarea = ({
  maxHeight,
  onPaste,
  onEnter,
  placeholder,
  className,
  ...props
}: Props) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea || !onPaste) return;

    textarea.addEventListener('paste', onPaste);

    return () => {
      textarea.removeEventListener('paste', onPaste);
    };
  }, [onPaste]);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea || !maxHeight) return;
    textarea.style.height = 'auto';
    const newHeight = Math.min(textarea.scrollHeight, maxHeight);
    textarea.style.height = `${newHeight}px`;
  }, [props.value]);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey && onEnter) {
      event.preventDefault();
      onEnter(event);
    }
  };

  return (
    <Textarea
      ref={textareaRef as any}
      {...props}
      onKeyDown={handleKeyDown}
      className={cn(
        'p-0 min-h-6 rounded-none resize-none border-none overflow-y-auto shadow-none focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0',
        className
      )}
      placeholder={placeholder}
      style={{ maxHeight }}
    />
  );
};

export default AutoResizeTextarea;