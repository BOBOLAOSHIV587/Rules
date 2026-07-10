/**
 * Plex - Rewrite display username.
 * Modifies the title, friendlyName, and username fields in Plex user API responses.
 *
 * Affected APIs:
 *   - GET /api/v2/user?includeSubscriptions=1
 *   - GET /api/v2/home/users
 */

const targetName = "Charles";
const body = JSON.parse($response.body);

if (body.title !== undefined) {
  body.title = targetName;
}
if (body.friendlyName !== undefined) {
  body.friendlyName = targetName;
}
if (body.username !== undefined) {
  body.username = targetName;
}

if (body.users) {
  for (const user of body.users) {
    if (user.title !== undefined) user.title = targetName;
    if (user.friendlyName !== undefined) user.friendlyName = targetName;
    if (user.username !== undefined) user.username = targetName;
  }
}

$done({ body: JSON.stringify(body) });