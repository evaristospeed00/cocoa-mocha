module.exports = {
  i18n: {
    locales: ['en'],
    defaultLocale: "en",
  },
  experimental: {
    // Use worker threads during build to avoid Windows child-process spawn EPERM failures.
    workerThreads: true,
  },
}
