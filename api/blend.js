export default (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({ message: 'Hello from the endpoint!' }));
}