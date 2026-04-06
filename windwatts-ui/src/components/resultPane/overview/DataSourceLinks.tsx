import { Link, Typography } from "@mui/material";
import { DATA_MODEL_INFO } from "../../../constants";
import { DataModel } from "../../../types";

export const DataSourceLinks = ({
  preferredModel,
}: {
  preferredModel: DataModel;
}) => {
  const modelInfo = DATA_MODEL_INFO[preferredModel];
  const label = modelInfo?.label ?? "";
  const sourceHref = modelInfo?.source_href ?? "";
  const helpHref = modelInfo?.help_href ?? "";

  return (
    <Typography variant="body2" color="text.secondary">
      * Estimates based on{" "}
      {sourceHref ? (
        <Link
          href={sourceHref}
          target="_blank"
          rel="noopener noreferrer"
          underline="hover"
        >
          {label}
        </Link>
      ) : (
        <>{label}</>
      )}
      {helpHref && (
        <>
          {" "}
          &mdash;{" "}
          <Link
            href={helpHref}
            target="_blank"
            rel="noopener noreferrer"
            underline="hover"
          >
            Learn more
          </Link>
        </>
      )}
      .
    </Typography>
  );
};
