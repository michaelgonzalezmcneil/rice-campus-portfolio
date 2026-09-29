// Mock content: imagery and coordinates are placeholders until campus data is connected.
export type College = { id: string; name: string; slug: string; image: string; description: string; coordinates: null };
const names = ["Baker", "Brown", "Chao", "Duncan", "Hanszen", "Jones", "Lovett", "Martel", "McMurtry", "Sid Richardson", "Wiess", "Will Rice"];
export const colleges: College[] = names.map((name) => ({ id: name.toLowerCase().replaceAll(" ", "-"), name: `${name} College`, slug: name.toLowerCase().replaceAll(" ", "-"), image: `/images/colleges/${name.toLowerCase().replaceAll(" ", "-")}.jpg`, description: name === "Duncan" ? "A bright home base on Rice's north side." : `Begin your Rice day from ${name}.`, coordinates: null }));
