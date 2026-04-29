# Cleaned gallery mapping

Generated 2026-04-29 via Higgsfield (`nano_banana_2`, image-to-image, 2k).

Each `GALLERY_PHOTOS` entry was passed through a single unified prompt so the
whole set reads as one cohesive aesthetic: leveled horizons (chandeliers, table
edges, ceiling lines), balanced exposure, gently lifted shadows, controlled
highlights, and a warm-neutral grade with subtle golden warmth and faint sage
tones. Each photo retains its original aspect ratio — no cropping, no
recomposition.

> **Heads up:** the `cleaned` URLs below point at Higgsfield's CloudFront CDN.
> They're stable for review but **should not be hardcoded into production**
> (the host isn't allowlisted in `next.config.js`'s image config and the URLs
> can rotate). For deployment, download all 23 files into
> `public/photos/gallery/` and rewrite `GALLERY_PHOTOS.src` to local paths.

## Mapping

| # | altKey                | category | aspect | cleaned dims | original                                            | cleaned                                                                                                                              |
|---|-----------------------|----------|--------|--------------|-----------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------|
| 1 | hallMain              | hall     | 3:2    | 2528x1696    | https://i.imgur.com/ln47mhE.jpg                     | https://d8j0ntlcm91z4.cloudfront.net/user_3D17c9jcARuPei8lGIeY98q4Sjc/hf_20260429_052653_a6626937-aade-4ada-8881-d2c3490d4c28.png |
| 2 | eventSetup            | events   | 4:3    | 2400x1792    | https://i.imgur.com/H9M6s5e.jpg                     | https://d8j0ntlcm91z4.cloudfront.net/user_3D17c9jcARuPei8lGIeY98q4Sjc/hf_20260429_052658_59a42a49-60af-4b02-9680-a53ecfa5544e.png |
| 3 | hallInterior          | hall     | 4:3    | 2400x1792    | https://i.imgur.com/6KXQOQZ.jpg                     | https://d8j0ntlcm91z4.cloudfront.net/user_3D17c9jcARuPei8lGIeY98q4Sjc/hf_20260429_052703_08d351cf-f694-4868-8242-bc9b239748f9.png |
| 4 | decorativeDetails     | details  | 3:4    | 1792x2400    | https://i.imgur.com/WLiiqYQ.jpg                     | https://d8j0ntlcm91z4.cloudfront.net/user_3D17c9jcARuPei8lGIeY98q4Sjc/hf_20260429_052708_e37aff46-c04a-4cdc-91c2-7b61d0b2c072.png |
| 5 | eventPanorama         | events   | 4:3    | 2400x1792    | https://i.imgur.com/AGlvxI4.jpg                     | https://d8j0ntlcm91z4.cloudfront.net/user_3D17c9jcARuPei8lGIeY98q4Sjc/hf_20260429_052713_ab321634-f189-4a89-81ec-c622c894a006.png |
| 6 | tableSetup            | setup    | 4:3    | 2400x1792    | https://i.imgur.com/7IRrMHO.jpg                     | https://d8j0ntlcm91z4.cloudfront.net/user_3D17c9jcARuPei8lGIeY98q4Sjc/hf_20260429_052718_69542eb9-8854-4bfe-9893-484126107025.png |
| 7 | hallSeating           | hall     | 3:4    | 1792x2400    | https://i.imgur.com/X4e1Ha1.jpg                     | https://d8j0ntlcm91z4.cloudfront.net/user_3D17c9jcARuPei8lGIeY98q4Sjc/hf_20260429_052723_9b258bfa-f1a3-487b-b982-f62ae3bb6c5e.png |
| 8 | eventWide             | events   | 4:3    | 2400x1792    | https://i.imgur.com/6nAJplD.jpg                     | https://d8j0ntlcm91z4.cloudfront.net/user_3D17c9jcARuPei8lGIeY98q4Sjc/hf_20260429_052729_4f79efd2-f270-49eb-9e17-4ff0aaef050c.png |
| 9 | chairArrangement      | setup    | 4:3    | 2400x1792    | https://i.imgur.com/BZtkcQp.jpg                     | https://d8j0ntlcm91z4.cloudfront.net/user_3D17c9jcARuPei8lGIeY98q4Sjc/hf_20260429_052734_58410ebd-b2e2-4f9b-974e-4aa316a2b668.png |
| 10 | closeDetails         | details  | 4:3    | 2400x1792    | https://i.imgur.com/vHNLSrJ.jpg                     | https://d8j0ntlcm91z4.cloudfront.net/user_3D17c9jcARuPei8lGIeY98q4Sjc/hf_20260429_052739_b23979a5-e533-49e9-84d7-4e53faf42ee9.png |
| 11 | hallLighting         | hall     | 3:4    | 1792x2400    | https://i.imgur.com/lwdmV5l.jpg                     | https://d8j0ntlcm91z4.cloudfront.net/user_3D17c9jcARuPei8lGIeY98q4Sjc/hf_20260429_052744_a928e3be-1eed-4a39-a655-aeb7b29bddcd.png |
| 12 | eventCelebration     | events   | 4:3    | 2400x1792    | https://i.imgur.com/6UgCavp.jpg                     | https://d8j0ntlcm91z4.cloudfront.net/user_3D17c9jcARuPei8lGIeY98q4Sjc/hf_20260429_052749_a8a99f87-5229-435e-8b3a-335908b7d3cf.png |
| 13 | stageSetup           | setup    | 4:3    | 2400x1792    | https://i.imgur.com/e1hXa6U.jpg                     | https://d8j0ntlcm91z4.cloudfront.net/user_3D17c9jcARuPei8lGIeY98q4Sjc/hf_20260429_052821_f57ba732-b7fe-43b5-b21c-2f96b03b03be.png |
| 14 | tableDecorations     | details  | 3:4    | 1792x2400    | https://i.imgur.com/KMftC0m.jpg                     | https://d8j0ntlcm91z4.cloudfront.net/user_3D17c9jcARuPei8lGIeY98q4Sjc/hf_20260429_052825_b8f6c8f7-f9ba-46dd-87a0-ec57a0bdb5eb.png |
| 15 | hallEntrance         | hall     | 3:4    | 1792x2400    | https://i.imgur.com/DB3sRpf.jpg                     | https://d8j0ntlcm91z4.cloudfront.net/user_3D17c9jcARuPei8lGIeY98q4Sjc/hf_20260429_052829_62f06c80-6b3c-4c94-8a81-8891df43e671.png |
| 16 | eventDining          | events   | 3:4    | 1792x2400    | https://i.imgur.com/7r6dEdZ.jpg                     | https://d8j0ntlcm91z4.cloudfront.net/user_3D17c9jcARuPei8lGIeY98q4Sjc/hf_20260429_052835_18c10135-d149-4092-9e97-976d25fa4966.png |
| 17 | roomConfig           | setup    | 4:3    | 2400x1792    | https://i.imgur.com/GbY9d67.jpg                     | https://d8j0ntlcm91z4.cloudfront.net/user_3D17c9jcARuPei8lGIeY98q4Sjc/hf_20260429_052840_3fc72a7b-5af2-4930-871b-50dbe06d131e.png |
| 18 | centerpiece          | details  | 3:4    | 1792x2400    | https://i.imgur.com/d6oVq2s.jpg                     | https://d8j0ntlcm91z4.cloudfront.net/user_3D17c9jcARuPei8lGIeY98q4Sjc/hf_20260429_052846_f728193d-01f3-408e-bacf-a413aa41421e.png |
| 19 | hallOverview         | hall     | 4:3    | 2400x1792    | https://i.imgur.com/fL5qyjB.jpg                     | https://d8j0ntlcm91z4.cloudfront.net/user_3D17c9jcARuPei8lGIeY98q4Sjc/hf_20260429_052851_80db481c-9b08-4163-b8d1-5d7af6de0823.png |
| 20 | sweet16Celebration   | events   | 4:3    | 2400x1792    | https://i.ibb.co/Z67T7tss/sweet-16.jpg              | https://d8j0ntlcm91z4.cloudfront.net/user_3D17c9jcARuPei8lGIeY98q4Sjc/hf_20260429_052856_2a421975-f90d-404f-bcb6-30dfd54fdf1d.png |
| 21 | sweet16Party         | events   | 21:9   | 3168x1344    | https://i.ibb.co/jZG0DvV3/sweet-16-2.jpg            | https://d8j0ntlcm91z4.cloudfront.net/user_3D17c9jcARuPei8lGIeY98q4Sjc/hf_20260429_052900_55ff8689-1004-41a6-9997-287f134d1bbd.png |
| 22 | eventMoment          | events   | 4:3    | 2400x1792    | https://i.ibb.co/993V0bjD/imagejpeg-0.jpg           | https://d8j0ntlcm91z4.cloudfront.net/user_3D17c9jcARuPei8lGIeY98q4Sjc/hf_20260429_052905_263887fb-770b-4bc0-87f3-ca7b13ce1b6b.png |
| 23 | eventGathering       | events   | 4:3    | 2400x1792    | https://i.ibb.co/0kbK9cW/IMG-3614.jpg               | https://d8j0ntlcm91z4.cloudfront.net/user_3D17c9jcARuPei8lGIeY98q4Sjc/hf_20260429_052910_7b7f30bd-1963-491e-a1b7-e46d640e0570.png |

## When you're ready to ship

Download all 23 cleaned URLs into `public/photos/gallery/cleaned-NN.png`,
update each `GALLERY_PHOTOS` entry's `src`, `width`, `height` to match the
local path and the new dims listed above, then `pnpm build` to verify
`next/image` is happy. Ping me and I can write the download script + the
edited `Photos.ts` in one go.
