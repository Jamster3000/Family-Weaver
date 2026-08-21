<script lang="ts">
  import Card from "$components/ui/Card.svelte";
  import TimelineCategoryView from "./TimelineCategoryView.svelte";
  import { personData } from "$personStore";
  import { IconHeart, IconBriefcase, IconHome } from "@tabler/icons-svelte-runes";

  type CategoryKey = 'lifeEvents' | 'workEducation' | 'placesLived';

  let selectedCategory: CategoryKey | null = null;
  export let isAddingEntry: boolean = false;

  const categories: Record<CategoryKey, { title: string; subtitle: string; icon: typeof IconHeart }> = {
    lifeEvents: {
      title: 'Life Events',
      subtitle: 'Birthdays, milestones, achievements, memorable moments',
      icon: IconHeart
    },
    workEducation: {
      title: 'Work & Education',
      subtitle: 'Jobs, schools, degrees, career milestones',
      icon: IconBriefcase
    },
    placesLived: {
      title: 'Places Lived',
      subtitle: 'Residences, moves, addresses over time',
      icon: IconHome
    }
  };
</script>

<div class="timelines-wrapper">
  {#if selectedCategory === null}
    <div class="categories-grid">
      {#each Object.entries(categories) as [key, config]}
        {@const count = $personData?.[key as CategoryKey]?.length ?? 0}
        {@const IconComponent = config.icon}

        <button
          class="card-action-wrapper"
          on:click={() => selectedCategory = key as CategoryKey}
          aria-label="View {config.title} timeline"
        >
          <Card width="100%" padding="medium">
            <div class="card-content">
              <div class="icon-well">
                <IconComponent size={28} stroke={1.5} color="white" />
              </div>

              <div class="text-group">
                <h3>{config.title}</h3>
                <p>{config.subtitle}</p>
              </div>

              <div class="badge">
                {count} {count === 1 ? 'entry' : 'entries'}
              </div>
            </div>
          </Card>
        </button>
      {/each}
    </div>

  {:else if selectedCategory in categories}
    <TimelineCategoryView
      categoryKey={selectedCategory}
      categoryTitle={categories[selectedCategory].title}
      onBack={() => selectedCategory = null}
      bind:isAddingEntry
    />
  {/if}
</div>

<style>
  .timelines-wrapper {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    box-sizing: border-box;
  }

  .categories-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
    height: 100%;
  }

  .card-action-wrapper {
    all: unset;
    display: block;
    width: 100%;
    height: 100%;
    box-sizing: border-box;
    cursor: pointer;
    border-radius: 8px;
    transition: transform 0.25s ease;
  }

  .card-action-wrapper:hover {
    transform: translateY(-3px);
  }

  .card-action-wrapper:focus-visible {
    outline: 2px solid var(--primary-colour);
    outline-offset: 4px;
    border-radius: 8px;
  }

  .card-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    text-align: center;
    gap: 16px;
    height: 100%;
  }

  .icon-well {
    background: color-mix(in srgb, var(--primary-colour) 80%, black 20%);
    width: 56px;
    height: 56px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 4px;
  }

  .text-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
    flex: 1;
  }

  h3 {
    font-size: var(--font-medium);
    font-weight: 600;
    color: var(--text-colour);
    margin: 0;
  }

  p {
    font-size: var(--font-small);
    color: var(--text-colour);
    opacity: 0.7;
    margin: 0;
    line-height: 1.4;
  }

  .badge {
    background: color-mix(in srgb, var(--secondary-background) 60%, black 40%);
    border: 1px solid color-mix(in srgb, var(--border-colour) 30%, transparent);
    color: var(--text-colour);
    padding: 4px 12px;
    border-radius: 100px;
    font-size: 0.75rem;
    font-weight: 600;
    opacity: 0.8;
  }
</style>