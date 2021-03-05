import cytoscape from "cytoscape"

declare module "convert-to-svg"
declare function generateSvg(cy: cytoscape.Core): any
declare function generateAndDownloadSvg(cy: cytoscape.Core): any