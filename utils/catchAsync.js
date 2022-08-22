module.exports = (fn) => {
  // we created a new anynomous functon in order to get the values of req,res, next
  // and this function should not called,but instead it should sit here and wait until express calls it
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};
