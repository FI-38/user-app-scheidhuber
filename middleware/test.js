export const testMiddleware = (req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    req.data = {my: 'data'};
    next();
}

export const timingMiddleware = (req, res, next) => {
  const start = Date.now();

  // Wird nach der Response aufgerufen
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`Request dauerte ${duration}ms`);
  });

  next();
};