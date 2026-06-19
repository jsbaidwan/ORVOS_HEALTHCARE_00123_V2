import PdfTemplateList from "./PdfTemplateList";

const ArchivePdfTemplate = () => {
  return (
    <div>
      <PdfTemplateList archived={true} />
    </div>
  );
};

export default ArchivePdfTemplate;
