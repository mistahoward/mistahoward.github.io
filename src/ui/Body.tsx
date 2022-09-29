import { HookRouter, useRoutes } from 'hookrouter';
import Error from './Error';

type BodyProps = {
	routes: HookRouter.RouteObject;
}

function Body({ routes }: BodyProps): JSX.Element {
	const routeResult = useRoutes(routes);
	return routeResult || <Error />;
}

export default Body;
