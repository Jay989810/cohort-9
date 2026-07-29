import { formatEther } from 'viem';

// ==============================================================================
// BEGINNER REACT LESSON: TypeScript Interfaces (Data Models)
// In React + TypeScript, an "interface" is like a blueprint for an object.
// It defines what fields (like name, image, price) an NFT object should have.
// ==============================================================================

// Interface describing the raw JSON metadata file stored for an NFT
export interface NFTMetadata {
  name?: string;
  description?: string;
  image?: string;
  attributes?: Array<{ trait_type: string; value: string | number }>;
}

// Interface describing an NFT item stored in our React state
export interface NFTItemData {
  tokenId: bigint;            // Unique number identifying the NFT (e.g. 1, 2, 3)
  tokenURI: string;           // Web link or IPFS link to the metadata JSON
  owner: string;              // Wallet address of who owns this NFT
  isListed: boolean;          // True if listed for sale on marketplace, False if not
  price: bigint;              // Price in Wei (smallest unit of ETH)
  priceFormatted: string;     // Friendly price in ETH decimal format (e.g. "0.05")
  publisher: string;          // Address of who published/listed it
  royalty: bigint;            // Percentage royalty paid to creator on sales (e.g. 5%)
  metadata?: NFTMetadata | null; // Parsed metadata object (name, description, image)
  imageSrc: string;           // Direct image URL to display in <img> tag
  name: string;               // Display title/name of the NFT
  description: string;        // Short summary of what the NFT is
}

// ==============================================================================
// HELPER 1: IPFS Link Resolver
// IPFS (InterPlanetary File System) links look like "ipfs://Qm..."
// Web browsers cannot open "ipfs://" directly, so we convert them to regular 
// web links like "https://ipfs.io/ipfs/Qm..."
// If IPFS is omitted or not used, it simply returns normal http/https URLs!
// ==============================================================================
export function resolveIPFS(url: string | undefined | null): string {
  // If no URL was provided, return empty string
  if (!url) return '';
  
  // Clean up whitespace
  const cleanUrl = url.trim();

  // Check if link starts with "ipfs://"
  if (cleanUrl.startsWith('ipfs://')) {
    const cid = cleanUrl.replace('ipfs://', '');
    // Convert to standard HTTP gateway link
    return `https://ipfs.io/ipfs/${cid}`;
  }

  // Otherwise, it's already a standard http:// or https:// URL or data URI
  return cleanUrl;
}

// ==============================================================================
// HELPER 2: Fetch NFT Metadata
// Reads a JSON file from tokenURI.
// Beginner tip: "async/await" means JavaScript will pause and wait for the internet
// fetch request to download the JSON data before continuing.
// Safe fallback: If IPFS is down or tokenURI is an image directly, it won't crash!
// ==============================================================================
export async function fetchNFTMetadata(tokenURI: string): Promise<NFTMetadata | null> {
  // Return null immediately if no URI was given
  if (!tokenURI) return null;

  const resolved = resolveIPFS(tokenURI);

  // If it's a direct image URL (e.g. ends with .png, .jpg, .svg or is a data URI), treat it as image!
  if (
    resolved.match(/\.(jpeg|jpg|gif|png|svg|webp)$/i) ||
    resolved.startsWith('data:image/') ||
    resolved.includes('picsum.photos') ||
    resolved.includes('unsplash.com')
  ) {
    return {
      image: resolved,
      name: undefined,
      description: undefined,
    };
  }

  try {
    if (resolved.startsWith('http://') || resolved.startsWith('https://')) {
      const res = await fetch(resolved);
      
      // Check if response is ok (HTTP status 200)
      if (res.ok) {
        const contentType = res.headers.get('content-type') || '';

        // If server returns an image instead of JSON, use it directly as image!
        if (contentType.includes('image/')) {
          return { image: resolved };
        }

        // Try parsing JSON safely
        try {
          const json = await res.json();
          return {
            name: json.name || json.title,
            description: json.description,
            image: resolveIPFS(json.image || json.image_url),
            attributes: json.attributes || [],
          };
        } catch {
          // If JSON parsing fails (e.g. plain text or binary image data), use resolved link as image
          return { image: resolved };
        }
      }
    }
  } catch (error) {
    // Graceful fallback if internet request fails - log quietly without crashing
    console.log('Using image fallback for tokenURI:', tokenURI);
  }

  return null;
}

// ==============================================================================
// HELPER 3: Truncate Wallet Address
// Long Ethereum addresses like "0x1234567890abcdef1234567890abcdef12345678"
// look messy on screen. This function turns them into "0x1234...5678".
// ==============================================================================
export function truncateAddress(address: string, chars = 4): string {
  if (!address) return '';
  return `${address.substring(0, chars + 2)}...${address.substring(address.length - chars)}`;
}

// ==============================================================================
// HELPER 4: Format Price from Wei to ETH
// Ethereum smart contracts calculate prices in "Wei" (1 ETH = 1,000,000,000,000,000,000 Wei).
// This function turns BigInt Wei numbers into user-friendly decimal strings like "0.05".
// ==============================================================================
export function formatPrice(priceWei: bigint | undefined | null): string {
  if (priceWei === undefined || priceWei === null) return '0';
  try {
    return formatEther(priceWei);
  } catch {
    return '0';
  }
}

// ==============================================================================
// HELPER 5: SVG Fallback Card Generator
// If an NFT has no image link or IPFS is completely offline/omitted, 
// this function generates a clean, colorful gradient image automatically!
// ==============================================================================
export function getFallbackImage(tokenId: bigint): string {
  // A palette of nice background colors based on token ID number
  const hues = [210, 260, 320, 180, 45, 140, 280, 15];
  const hue1 = hues[Number(tokenId % BigInt(hues.length))];
  const hue2 = (hue1 + 60) % 360;

  // Simple SVG graphic string
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">
    <defs>
      <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="hsl(${hue1}, 85%, 55%)"/>
        <stop offset="100%" stop-color="hsl(${hue2}, 85%, 45%)"/>
      </linearGradient>
    </defs>
    <rect width="400" height="400" fill="url(#g)"/>
    <circle cx="200" cy="200" r="70" fill="none" stroke="rgba(255,255,255,0.3)" stroke-width="6"/>
    <text x="200" y="212" font-family="sans-serif" font-size="38" font-weight="bold" fill="#ffffff" text-anchor="middle">#${tokenId.toString()}</text>
    <text x="200" y="340" font-family="sans-serif" font-size="14" font-weight="normal" fill="rgba(255,255,255,0.8)" text-anchor="middle">NFT ITEM</text>
  </svg>`;

  // Convert SVG string to data URI image link
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
