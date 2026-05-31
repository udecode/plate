import { cn } from '@/lib/utils';

function PageHeader({
  children,
  className,
  ...props
}: React.ComponentProps<'section'>) {
  return (
    <section className={cn('border-grid', className)} {...props}>
      <div className="container-wrapper">
        <div className="container flex flex-col items-center gap-2 px-6 py-8 text-center md:py-16 lg:py-20 xl:gap-4">
          {children}
        </div>
      </div>
    </section>
  );
}

function PageHeaderHeading({
  className,
  ...props
}: React.ComponentProps<'h1'>) {
  return (
    <h1
      className={cn(
        'max-w-3xl text-balance font-semibold text-3xl text-primary leading-tighter tracking-tight lg:font-semibold lg:leading-[1.1] xl:text-5xl xl:tracking-tighter',
        className
      )}
      {...props}
    />
  );
}

function PageHeaderDescription({
  className,
  ...props
}: React.ComponentProps<'p'>) {
  return (
    <p
      className={cn(
        'max-w-4xl text-balance text-base text-foreground sm:text-lg',
        className
      )}
      {...props}
    />
  );
}

function PageActions({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        'flex w-full items-center justify-center gap-2 pt-2 **:data-[slot=button]:shadow-none',
        className
      )}
      {...props}
    />
  );
}

export { PageActions, PageHeader, PageHeaderDescription, PageHeaderHeading };
