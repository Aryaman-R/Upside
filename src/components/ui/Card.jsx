// Generic surface container. `as` lets callers render it as a section/article.

export default function Card({ as: Tag = 'div', className = '', children, ...props }) {
  return (
    <Tag className={['surface p-5', className].join(' ')} {...props}>
      {children}
    </Tag>
  )
}
