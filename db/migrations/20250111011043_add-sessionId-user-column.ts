import { Knex } from "knex"

export async function up(knex: Knex): Promise<void> {
    await knex.schema.alterTable('users', (table) => {
        table.text('sessionId')
    })
}

export async function down(knex: Knex): Promise<void> {
    return knex.schema.table('users', () => {
        return Promise.all([
            knex.schema.hasColumn('users', 'sessionId').then(() => {
                knex.schema.table('users', t => t.dropColumn('sessionId'));
            }),
        ])
    })
}

