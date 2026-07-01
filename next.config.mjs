/** @type {import('next').NextConfig} */
const nextConfig = {
    turbopack: {},
};

export default nextConfig;

import('@opennextjs/cloudflare').then(m => m.initOpenNextCloudflareForDev());
