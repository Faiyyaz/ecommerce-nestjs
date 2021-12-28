import {
  Entity,
  Tree,
  Column,
  PrimaryGeneratedColumn,
  TreeChildren,
  TreeParent,
  OneToOne,
  JoinColumn,
  BaseEntity,
} from 'typeorm';
import { MarketingAttribute } from './marketing.attribute.entity';

@Entity()
@Tree('closure-table', {
  closureTableName: 'category_to_category',
  ancestorColumnName: (column) => 'sourceCategory' + column.propertyName,
  descendantColumnName: (column) => 'ChildCategory' + column.propertyName,
})
export class Category extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  code: string;

  @Column({ name: 'marketingAttributeId', nullable: false })
  marketingAttributeId: number;

  @OneToOne(() => MarketingAttribute, { nullable: false })
  @JoinColumn()
  marketingAttribute: MarketingAttribute;

  @TreeChildren()
  children: Category[];

  @TreeParent()
  parent: Category;
}
