import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import { TextStyle } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import { useEffect } from "react";
import {
  Bold, Italic, UnderlineIcon, AlignLeft, AlignCenter, AlignRight,
  AlignJustify, List, ListOrdered, Palette,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  minHeight?: string;
}

const TOOLBAR_COLORS = [
  "#000000", "#374151", "#6b7280",
  "#1d4ed8", "#0891b2", "#059669",
  "#dc2626", "#d97706", "#7c3aed",
  "#be185d", "#ffffff",
];

function ToolbarButton({
  onClick,
  active,
  title,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      onMouseDown={e => { e.preventDefault(); onClick(); }}
      className={cn(
        "p-1.5 rounded text-sm transition-colors",
        active
          ? "bg-primary text-primary-foreground"
          : "hover:bg-muted text-muted-foreground hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}

export function RichTextEditor({ value, onChange, placeholder, className, minHeight = "120px" }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Underline,
      TextStyle,
      Color,
    ],
    content: value || "",
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange(html === "<p></p>" ? "" : html);
    },
    editorProps: {
      attributes: {
        class: "outline-none min-h-[inherit] prose prose-sm max-w-none dark:prose-invert",
        "data-placeholder": placeholder || "",
      },
      handleKeyDown(view, event) {
        if (event.key === " ") {
          const { state } = view;
          const { $from } = state.selection;
          const textBefore = $from.nodeBefore?.text ?? "";
          const charBefore = textBefore.slice(-1);
          if (charBefore === " " || charBefore === "\u00a0") {
            view.dispatch(state.tr.insertText("\u00a0"));
            return true;
          }
        }
        return false;
      },
    },
  });

  useEffect(() => {
    if (!editor) return;
    if (editor.getHTML() !== value && value !== undefined) {
      editor.commands.setContent(value || "");
    }
  }, [value, editor]);

  if (!editor) return null;

  return (
    <div className={cn("border rounded-md overflow-hidden", className)}>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 border-b bg-muted/30">
        {/* Headings — native select without preventDefault so the dropdown opens */}
        <select
          className="text-xs border rounded px-1.5 py-1 bg-background text-foreground h-7 mr-1 cursor-pointer"
          value={
            editor.isActive("heading", { level: 1 }) ? "1" :
            editor.isActive("heading", { level: 2 }) ? "2" :
            editor.isActive("heading", { level: 3 }) ? "3" : "0"
          }
          onChange={e => {
            const v = Number(e.target.value);
            if (v === 0) editor.chain().focus().setParagraph().run();
            else editor.chain().focus().toggleHeading({ level: v as 1|2|3 }).run();
          }}
        >
          <option value="0">Обычный</option>
          <option value="1">Заголовок 1</option>
          <option value="2">Заголовок 2</option>
          <option value="3">Заголовок 3</option>
        </select>

        <div className="w-px h-5 bg-border mx-0.5" />

        <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")} title="Жирный (Ctrl+B)">
          <Bold className="h-3.5 w-3.5" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")} title="Курсив (Ctrl+I)">
          <Italic className="h-3.5 w-3.5" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive("underline")} title="Подчёркнутый (Ctrl+U)">
          <UnderlineIcon className="h-3.5 w-3.5" />
        </ToolbarButton>

        <div className="w-px h-5 bg-border mx-0.5" />

        <ToolbarButton onClick={() => editor.chain().focus().setTextAlign("left").run()} active={editor.isActive({ textAlign: "left" })} title="По левому краю">
          <AlignLeft className="h-3.5 w-3.5" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().setTextAlign("center").run()} active={editor.isActive({ textAlign: "center" })} title="По центру">
          <AlignCenter className="h-3.5 w-3.5" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().setTextAlign("right").run()} active={editor.isActive({ textAlign: "right" })} title="По правому краю">
          <AlignRight className="h-3.5 w-3.5" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().setTextAlign("justify").run()} active={editor.isActive({ textAlign: "justify" })} title="По ширине">
          <AlignJustify className="h-3.5 w-3.5" />
        </ToolbarButton>

        <div className="w-px h-5 bg-border mx-0.5" />

        <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")} title="Маркированный список">
          <List className="h-3.5 w-3.5" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")} title="Нумерованный список">
          <ListOrdered className="h-3.5 w-3.5" />
        </ToolbarButton>

        <div className="w-px h-5 bg-border mx-0.5" />

        {/* Color picker */}
        <div className="relative group">
          <button
            type="button"
            title="Цвет текста"
            onMouseDown={e => e.preventDefault()}
            className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          >
            <Palette className="h-3.5 w-3.5" />
          </button>
          <div className="absolute top-full left-0 mt-1 p-1.5 bg-popover border rounded-md shadow-md hidden group-hover:flex flex-wrap gap-1 z-50 w-32">
            {TOOLBAR_COLORS.map(color => (
              <button
                key={color}
                type="button"
                title={color}
                onMouseDown={e => { e.preventDefault(); editor.chain().focus().setColor(color).run(); }}
                className="w-5 h-5 rounded-sm border border-border/50 hover:scale-110 transition-transform"
                style={{ backgroundColor: color }}
              />
            ))}
            <button
              type="button"
              title="Сбросить цвет"
              onMouseDown={e => { e.preventDefault(); editor.chain().focus().unsetColor().run(); }}
              className="w-5 h-5 rounded-sm border border-border flex items-center justify-center text-[10px] text-muted-foreground hover:bg-muted"
            >×</button>
          </div>
        </div>
      </div>

      {/* Editor area */}
      <div
        className="px-3 py-2 bg-background cursor-text"
        style={{ minHeight }}
        onClick={() => editor.commands.focus()}
      >
        <EditorContent editor={editor} />
      </div>

      <style>{`
        .ProseMirror p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: hsl(var(--muted-foreground));
          pointer-events: none;
          height: 0;
        }
        .ProseMirror:focus { outline: none; }
        .ProseMirror h1 { font-size: 1.5rem; font-weight: 700; margin-bottom: 0.5rem; }
        .ProseMirror h2 { font-size: 1.25rem; font-weight: 600; margin-bottom: 0.4rem; }
        .ProseMirror h3 { font-size: 1.1rem; font-weight: 600; margin-bottom: 0.35rem; }
        .ProseMirror p { margin-bottom: 0.5rem; white-space: pre-wrap; }
        .ProseMirror ul { list-style-type: disc; padding-left: 1.25rem; margin-bottom: 0.5rem; }
        .ProseMirror ol { list-style-type: decimal; padding-left: 1.25rem; margin-bottom: 0.5rem; }
        .ProseMirror li { margin-bottom: 0.15rem; }
        .ProseMirror strong { font-weight: 700; }
        .ProseMirror em { font-style: italic; }
        .ProseMirror u { text-decoration: underline; }
        .ProseMirror [style*="text-align: center"] { text-align: center; }
        .ProseMirror [style*="text-align: right"] { text-align: right; }
        .ProseMirror [style*="text-align: justify"] { text-align: justify; }
      `}</style>
    </div>
  );
}

export function renderRichText(html: string, className?: string) {
  if (!html) return null;
  return (
    <div
      className={cn(
        "prose prose-sm max-w-none dark:prose-invert",
        "[&_h1]:text-2xl [&_h1]:font-bold [&_h1]:mb-3",
        "[&_h2]:text-xl [&_h2]:font-semibold [&_h2]:mb-2",
        "[&_h3]:text-lg [&_h3]:font-semibold [&_h3]:mb-2",
        "[&_p]:mb-2 [&_p]:leading-relaxed [&_p]:whitespace-pre-wrap",
        "[&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-2",
        "[&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-2",
        "[&_li]:mb-1",
        "[&_strong]:font-bold",
        "[&_em]:italic",
        "[&_u]:underline",
        className,
      )}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").replace(/\u00a0/g, " ").trim();
}
