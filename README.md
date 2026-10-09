# photo-storage
Website penyimpanan foto dan video"

## Netlify deployment

The frontend is served directly from `public/` and does not require a build step.
`netlify.toml` sets the publish directory to `public` and clears the build command,
replacing the previously configured `npm run build` command.

The Express server in `server.js` is separate from this static deployment. Google
authentication and Drive upload routes require a running backend; this deployment
configuration does not deploy those routes as Netlify Functions.
