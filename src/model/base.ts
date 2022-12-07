export interface BaseTime {
  createdAt?: Date;
  updatedAt?: Date;
}

export const SchemaWithBaseTime = (schema) => {
  return {
    ...schema,
    createdAt: { type: Date },
    updatedAt: { type: Date },
  };
};

export async function preSaveAddBaseTime(next) {
  const now = new Date();
  if (!this.createdAt) {
    this.createdAt = now;
  }
  next();
}
