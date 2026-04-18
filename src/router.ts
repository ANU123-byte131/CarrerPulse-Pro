import { Link as RouterLink, Navigate as RouterNavigate, useNavigate as useRouterNavigate, useParams as useRouterParams } from 'react-router-dom';
import { Path } from './routes';

export const Link = RouterLink;
export const Navigate = RouterNavigate;

export const useNavigate = () => {
  const navigate = useRouterNavigate();
  return (to: Path | number, options?: { replace?: boolean; state?: any }) => {
    if (typeof to === 'number') {
      navigate(to);
    } else {
      navigate(to, options);
    }
  };
};

export const useParams = useRouterParams;
export type { Path };
