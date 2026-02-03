"use client";

const DetailHeader = () => {
  return (
    <div className="flex flex-col gap-y-1">
      <p className="font-bold text-lg">Update Station</p>
      <p className="font-light text-sm text-muted-foreground">
        Modify details for this station
      </p>
    </div>
  );
};

export default DetailHeader;
