/** @type {import('next').NextConfig} */
const nextConfig = {
  // Emit a self-contained server bundle for the slim Docker runtime stage.
  output: "standalone",
};

export default nextConfig;
