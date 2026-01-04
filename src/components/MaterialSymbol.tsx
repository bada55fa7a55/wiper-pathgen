type Props = {
  size: 16 | 24 | 32 | 48;
  symbol: string;
};

export function MaterialSymbol(props: Props) {
  return (
    <span
      style={{
        display: 'inline-block',
        width: `${props.size}px`,
        height: `${props.size}px`,
        'font-size': `${props.size}px`,
      }}
      aria-hidden={true}
      class="material-symbols-rounded"
    >
      {props.symbol}
    </span>
  );
}
