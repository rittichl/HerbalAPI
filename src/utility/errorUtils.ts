// src/utils/errorUtils.ts
import { UniqueConstraintError, ForeignKeyConstraintError } from 'sequelize';

export function isUniqueConstraintError(error: unknown): error is UniqueConstraintError {
    return error instanceof Error && 'name' in error && error.name === 'SequelizeUniqueConstraintError';
}

export function isForeignKeyConstraintError(error: unknown): error is ForeignKeyConstraintError {
    return error instanceof Error && 'name' in error && error.name === 'SequelizeForeignKeyConstraintError';
}