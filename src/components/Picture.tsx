import { MEDIA, img, srcSet, type MediaId } from '../data/media'

interface Props extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src' | 'alt'> {
  id: MediaId
  eager?: boolean
  sizes?: string
}

/** Responsive WebP from the asset manifest (900w mobile / 2000w desktop). */
export function Picture({ id, eager, sizes = '100vw', ...rest }: Props) {
  const a = MEDIA[id]
  return (
    <img
      src={img(a)}
      srcSet={srcSet(a)}
      sizes={sizes}
      alt={a.alt}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      {...(eager ? { fetchPriority: 'high' as const } : {})}
      {...rest}
    />
  )
}
