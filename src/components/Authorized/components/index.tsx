import Authorized from './Authorized';
import AuthorizedRoute from './AuthorizedRoute';
import Secured from './Secured';
import check, { hasPermissions } from './CheckPermissions';
import renderAuthorize from './renderAuthorize';

Authorized.Secured = Secured;
Authorized.AuthorizedRoute = AuthorizedRoute;
Authorized.check = check;
Authorized.hasPermissions = hasPermissions;

const RenderAuthorize = renderAuthorize(Authorized);

export default RenderAuthorize;
