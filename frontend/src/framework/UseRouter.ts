type Router = {
  push: (path: string) => void;
  back: () => void;
  pathname: string;
};

export default function UseRouter(): Router {
  return {
    push: (path: string) => {
      window.location.href = path;
    },
    back: () => {
      window.history.back();
    },
    pathname: window.location.pathname,
  };
}
