import type { ButtonHTMLAttributes, PropsWithChildren, ReactNode } from 'react';

export function LogoMark() { return <span className="logo-mark" aria-hidden="true">✦</span>; }
export function Card({ children, className = '' }: PropsWithChildren<{ className?: string }>) { return <section className={`card ${className}`}>{children}</section>; }
export function Button({ children, variant = 'jade', ...props }: PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'jade' | 'gold' | 'ghost' }>) { return <button className={`button ${variant}`} {...props}>{children}</button>; }
export function Status({ children, tone = 'jade' }: PropsWithChildren<{ tone?: 'jade' | 'gold' | 'danger' }>) { return <span className={`status ${tone}`}>{children}</span>; }
export function Metric({ icon, label, value, detail }: { icon: string; label: string; value: string; detail: string }) { return <Card className="metric"><span className="metric-icon">{icon}</span><div><p className="eyebrow">{label}</p><strong>{value}</strong><p className="metric-detail">{detail}</p></div></Card>; }
export function PageHeader({ title, description, action }: { title: string; description: string; action?: ReactNode }) { return <header className="page-header"><div><p className="eyebrow">A KYAN NYAN · ADMIN</p><h1>{title}</h1><p className="page-description">{description}</p></div>{action}</header>; }
