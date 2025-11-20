# TODO

- Can probably get rid of everything except the helper functions tbh. Think the render and buildsite are remnants from before using site builder e.g. webpack

7. Breaking API Change ⚠️ Important: The render() and buildSite() methods are now async to support ESM dynamic imports for controllers. Users will need to await these calls:
