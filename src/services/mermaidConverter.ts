import { parseMermaidToExcalidraw } from "@excalidraw/mermaid-to-excalidraw";
import { convertToExcalidrawElements } from "@excalidraw/excalidraw";

export async function convertMermaidToExcalidraw(mermaidCode: string) {
  try {
    const result = await parseMermaidToExcalidraw(mermaidCode);
    if (result.elements && result.elements.length > 0) {
      const elements = convertToExcalidrawElements(result.elements);
      return {
        success: true as const,
        elements,
        // files contains image data for SVG-based diagrams (graphImage type)
        files: result.files || undefined,
      };
    }
    return { success: false as const, error: "No elements generated" };
  } catch (err) {
    return {
      success: false as const,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}
