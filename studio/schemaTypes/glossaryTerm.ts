import {defineField, defineType} from 'sanity'

export const glossaryTerm = defineType({
  name: 'glossaryTerm',
  title: 'Glossary Term',
  type: 'document',
  fields: [
    defineField({
      name: 'term',
      title: 'Term',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'term',
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'arabic',
      title: 'Arabic',
      type: 'string',
      description: 'Arabic term, if applicable',
    }),
    defineField({
      name: 'definition',
      title: 'Definition',
      type: 'text',
      rows: 4,
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    select: {
      term: 'term',
      arabic: 'arabic',
    },
    prepare({term, arabic}) {
      return {
        title: term,
        subtitle: arabic,
      }
    },
  },
  orderings: [
    {
      title: 'Alphabetical',
      name: 'termAsc',
      by: [{field: 'term', direction: 'asc'}],
    },
  ],
})
