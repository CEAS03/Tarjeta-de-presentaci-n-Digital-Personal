type PropiedadesRetrato = {
  src: string;
  nombre: string;
};

/** Retrato principal con el anillo de luz neutro del hub. */
export function Retrato({ src, nombre }: PropiedadesRetrato) {
  return (
    <div className="retrato">
      <img
        className="retrato__imagen"
        src={src}
        alt={`Retrato de ${nombre}`}
        width="640"
        height="640"
        loading="eager"
        {...{ fetchpriority: 'high' }}
        decoding="async"
      />
    </div>
  );
}

export default Retrato;
