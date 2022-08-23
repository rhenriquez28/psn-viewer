# PSN Viewer - A mini PSN Profiles made with the T3-Stack

# Features

- See your PSN profile with your most recent games
- Visit a game that you've played to check screenshots, description and metadata from the PS Store (courtesy of [PlatPrices](https://platprices.com/developers.php)) and check the trophies you've earned for that game
- Search for any visible user on PSN and you can also see their profile and what trophies they've earned in the games they've played
- (Coming soon) Compare trophies with another user if you both have played the exact same game.

# Why

I started this project originally as a way to learn [Nx](https://nx.dev/) with Angular. Got frustrated when trying to add a Nest.js backend. Found [Theo](https://twitter.com/t3dotgg) midway through. Really liked his views and found the [T3-Stack](https://init.tips) very intriguing. I wanted to learn React for the longest time so I decided to bite the bullet, used [create-t3-app](https://create.t3.gg/) to spin up a new project and migrated my Angular HTML to JSX and finished it here.

My immediate conclusions are that I enjoy React more than Angular now. I'm quite happy that my file structure is waaaay more simple than any Angular project I've ever worked with, and I find that creating components via functions that return JSX is faster and more enjoyable for me than SFCs or the Angular way.

If you want to see the source code for the previous Angular project, you can check it out [here.](https://github.com/rhenriquez28/psn-viewer-old)

# What's it made of?

- T3 Stack

  - TypeScript
  - Next.js
  - NextAuth.js
  - Tailwind CSS
  - tRPC
  - Prisma

- PlatPrices API
- [psn-api](https://github.com/achievements-app/psn-api)
- [Ant Design](https://ant.design/)
- [React Image Gallery](https://github.com/xiaolin/react-image-gallery)
- MySQL (via [Planetscale](https://planetscale.com/))
- Deployed via [Vercel](https://vercel.com/)
