/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: false,
	webpack: (config) => {
		// this will override the experiments
		config.experiments = { ...config.experiments, topLevelAwait: true };
		// this will just update topLevelAwait property of config.experiments
		// config.experiments.topLevelAwait = true 
		return config;
    },
	httpAgentOptions: {
		keepAlive: false,
	},
	distDir: process.env.NODE_ENV == 'development' ? '.next' : `build/${buildname}`,
	generateBuildId: async () => {
		return buildname;
	},
}

export default nextConfig