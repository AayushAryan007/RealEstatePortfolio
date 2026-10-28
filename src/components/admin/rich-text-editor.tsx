"use client"

import { EditorContent, useEditor, useEditorState } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import { BoldIcon, Heading2Icon, Heading3Icon, ItalicIcon, LinkIcon, ListIcon, ListOrderedIcon, QuoteIcon, Redo2Icon, Undo2Icon } from "lucide-react"

import { cn } from "@/lib/utils"

/**
 * Description editor (Tiptap) with just the formatting the site supports:
 * headings, bold/italic, lists, quotes and links. Outputs HTML, which the
 * server sanitises again on save.
 */
export function RichTextEditor({ value, onChange, id }: { value: string; onChange: (html: string) => void; id?: string }) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        code: false,
        codeBlock: false,
        horizontalRule: false,
        link: { openOnClick: false, autolink: true, protocols: ["https", "mailto", "tel"] },
      }),
    ],
    content: value,
    immediatelyRender: false, // avoid hydration mismatch with SSR
    editorProps: {
      attributes: {
        id: id ?? "",
        class:
          "min-h-48 px-4 py-3 text-sm leading-relaxed text-cream outline-none [&_h2]:mt-4 [&_h2]:font-heading [&_h2]:text-2xl [&_h3]:mt-3 [&_h3]:font-heading [&_h3]:text-xl [&_li]:ml-5 [&_ol]:list-decimal [&_p]:my-2 [&_ul]:list-disc [&_a]:text-gold [&_a]:underline [&_blockquote]:border-l-2 [&_blockquote]:border-gold/50 [&_blockquote]:pl-3 [&_blockquote]:italic",
      },
    },
    onUpdate: ({ editor }) => onChange(editor.isEmpty ? "" : editor.getHTML()),
  })

  const state = useEditorState({
    editor,
    selector: ({ editor }) =>
      editor
        ? {
            bold: editor.isActive("bold"),
            italic: editor.isActive("italic"),
            h2: editor.isActive("heading", { level: 2 }),
            h3: editor.isActive("heading", { level: 3 }),
            bullet: editor.isActive("bulletList"),
            ordered: editor.isActive("orderedList"),
            quote: editor.isActive("blockquote"),
            link: editor.isActive("link"),
          }
        : null,
  })

  const setLink = () => {
    if (!editor) return
    const previous = editor.getAttributes("link").href as string | undefined
    const url = window.prompt("Link URL (leave empty to remove)", previous ?? "https://")
    if (url === null) return
    if (url === "") editor.chain().focus().extendMarkRange("link").unsetLink().run()
    else editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run()
  }

  const tools = editor
    ? [
        { label: "Heading", Icon: Heading2Icon, active: state?.h2, run: () => editor.chain().focus().toggleHeading({ level: 2 }).run() },
        { label: "Subheading", Icon: Heading3Icon, active: state?.h3, run: () => editor.chain().focus().toggleHeading({ level: 3 }).run() },
        { label: "Bold", Icon: BoldIcon, active: state?.bold, run: () => editor.chain().focus().toggleBold().run() },
        { label: "Italic", Icon: ItalicIcon, active: state?.italic, run: () => editor.chain().focus().toggleItalic().run() },
        { label: "Bullet list", Icon: ListIcon, active: state?.bullet, run: () => editor.chain().focus().toggleBulletList().run() },
        { label: "Numbered list", Icon: ListOrderedIcon, active: state?.ordered, run: () => editor.chain().focus().toggleOrderedList().run() },
        { label: "Quote", Icon: QuoteIcon, active: state?.quote, run: () => editor.chain().focus().toggleBlockquote().run() },
        { label: "Link", Icon: LinkIcon, active: state?.link, run: setLink },
        { label: "Undo", Icon: Undo2Icon, active: false, run: () => editor.chain().focus().undo().run() },
        { label: "Redo", Icon: Redo2Icon, active: false, run: () => editor.chain().focus().redo().run() },
      ]
    : []

  return (
    <div className="overflow-hidden rounded-xs border border-input bg-ink/60 focus-within:border-gold">
      <div role="toolbar" aria-label="Formatting" className="flex flex-wrap gap-0.5 border-b border-input p-1.5">
        {tools.map(({ label, Icon, active, run }) => (
          <button
            key={label}
            type="button"
            onClick={run}
            aria-label={label}
            aria-pressed={active}
            title={label}
            className={cn("grid size-8 place-items-center rounded-xs transition-colors", active ? "bg-gold/20 text-gold" : "text-cream/70 hover:bg-white/5 hover:text-cream")}
          >
            <Icon className="size-4" />
          </button>
        ))}
      </div>
      {editor ? <EditorContent editor={editor} /> : <div className="min-h-48" />}
    </div>
  )
}
